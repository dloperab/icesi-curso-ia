/**
 * Custom hook for managing habit logs (check-ins)
 * Handles creating logs with revalidation of multiple keys
 */

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { HabitLog } from '@/types/habits';
import { createHabitLogSchema } from '@/lib/validations';

interface UseHabitLogsReturn {
  createLog: (habitId: string, note?: string, onSuccess?: () => Promise<void>) => Promise<HabitLog>;
  isCreating: boolean;
}

/**
 * Hook to manage habit logs with revalidation
 * Revalidates useHabits and any provided callback after creating a log
 * @returns Object with createLog function and loading state
 */
export function useHabitLogs(): UseHabitLogsReturn {
  const [isCreating, setIsCreating] = useState(false);
  const { mutate: mutateHabits } = useSWR('/api/habits');

  /**
   * Create a new habit log (check-in)
   * @param habitId - ID of the habit to log
   * @param note - Optional note for the check-in
   * @param onSuccess - Optional callback to execute after successful log creation (e.g., to mutate stats)
   * @returns Created log
   */
  const createLog = useCallback(
    async (habitId: string, note?: string, onSuccess?: () => Promise<void>): Promise<HabitLog> => {
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

        // Revalidate habits list (in case stats changed)
        await mutateHabits();

        // Execute optional callback for additional revalidations (e.g., habit stats)
        if (onSuccess) {
          await onSuccess();
        }

        return log;
      } finally {
        setIsCreating(false);
      }
    },
    [mutateHabits]
  );

  return {
    createLog,
    isCreating,
  };
}
