/**
 * Custom hook for managing habits with SWR
 * Handles fetching, creating, and deleting habits with optimistic updates
 */

import useSWR from 'swr';
import { Habit, CreateHabitInput } from '@/types/habits';
import { createHabitSchema } from '@/lib/validations';

interface UseHabitsReturn {
  habits: Habit[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  createHabit: (data: CreateHabitInput) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  mutate: () => void;
}

/**
 * Hook to manage habits with optimistic updates
 * @returns Object with habits data, loading state, and mutation functions
 */
export function useHabits(): UseHabitsReturn {
  const { data, error, isLoading, mutate } = useSWR<{ habits: Habit[] }>('/api/habits');

  const habits = data?.habits;

  /**
   * Create a new habit with optimistic update
   * @param habitData - Habit creation data
   * @returns Created habit
   */
  const createHabit = async (habitData: CreateHabitInput): Promise<Habit> => {
    // Validate input data with Zod
    const validatedData = createHabitSchema.parse(habitData);

    // Optimistic update: add to local data immediately
    const optimisticHabit: Habit = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: validatedData.name,
      description: validatedData.description || null,
      frequency: validatedData.frequency,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Update local state optimistically
    const previousData = data;
    mutate(
      {
        habits: [...(habits || []), optimisticHabit],
      },
      false // Don't revalidate yet
    );

    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create habit');
      }

      const { habit } = await response.json();

      // Revalidate with actual data from server
      mutate();

      return habit;
    } catch (err) {
      // Rollback optimistic update on error
      mutate(previousData, false);
      throw err;
    }
  };

  /**
   * Delete a habit with optimistic update
   * @param id - Habit ID to delete
   */
  const deleteHabit = async (id: string): Promise<void> => {
    // Store previous state for rollback
    const previousData = data;

    // Optimistic update: remove from local data immediately
    mutate(
      {
        habits: (habits || []).filter((habit) => habit.id !== id),
      },
      false // Don't revalidate yet
    );

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete habit');
      }

      // Revalidate with server state (though 204 response has no body)
      mutate();
    } catch (err) {
      // Rollback optimistic update on error
      mutate(previousData, false);
      throw err;
    }
  };

  return {
    habits,
    isLoading,
    error,
    createHabit,
    deleteHabit,
    mutate,
  };
}
