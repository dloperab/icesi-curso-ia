/**
 * Custom hook for managing habit logs (check-ins)
 * Handles creating logs with revalidation of multiple keys
 */

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { HabitLog } from '@/types/habits';
import { createHabitLogSchema } from '@/lib/validations';

interface UseHabitLogsReturn {
  createLog: (habitId: string, note?: string) => Promise<HabitLog>;
  isCreating: boolean;
}

/**
 * Hook to manage habit logs with revalidation
 * Revalidates both useHabits and useHabitStats after creating a log
 * Accepts optional mutate function for habit stats to enable immediate UI updates
 * @param onStatsChange - Optional callback function to revalidate stats (e.g., from useHabitStats)
 * @returns Object with createLog function and loading state
 */
export function useHabitLogs(onStatsChange?: (habitId: string) => Promise<any> | void): UseHabitLogsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: mutateHabits } = useSWR('/api/habits');
  // Note: mutateHabitStats would be called dynamically with the habit ID
  // This is handled in the createLog function
  const { mutate: mutateSWR } = useSWR(null);

  /**
   * Create a new habit log (check-in)
   * @param habitId - ID of the habit to log
   * @param note - Optional note for the check-in
   * @returns Created log
   */
  const createLog = useCallback(
    async (habitId: string, note?: string): Promise<HabitLog> => {
      setIsCreating(true);

      try {
        // Validate input with Zod
        const validatedData = createHabitLogSchema.parse({ note });

        const response = await fetch(`/api/habits/${habitId}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Handle specific error codes
          if (response.status === 404) {
            throw new Error('Habit not found');
          }
          if (response.status === 409) {
            throw new Error('Log already exists for today');
          }

          throw new Error(errorData.error || 'Failed to create log');
        }

        const { log } = await response.json();

        // Revalidate multiple keys after successful creation
        await mutateHabits(); // Revalidate habits list (in case stats changed)
        // Also revalidate the stats for this specific habit
        if (onStatsChange) {
          // Call revalidation (may be sync or async)
          const result = onStatsChange(habitId);
          // If it returns a promise, wait for it
          if (result && typeof result.then === 'function') {
            await result;
          }
        } else {
          // Fallback if no callback provided
          await mutateSWR(`/api/habits/${habitId}/stats`);
        }

        return log;
      } finally {
        setIsCreating(false);
      }
    },
    [mutateHabits, mutateSWR]
  );

  return {
    createLog,
    isCreating,
  };
}
