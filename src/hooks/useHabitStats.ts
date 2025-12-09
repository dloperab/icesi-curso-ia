/**
 * Custom hook for fetching habit statistics
 * Supports optional date filtering with from/to parameters
 */

import useSWR from 'swr';
import { HabitStats } from '@/types/habits';

interface UseHabitStatsReturn {
  stats: HabitStats | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Hook to fetch habit statistics with optional temporal filtering
 * @param habitId - ID of the habit to fetch stats for
 * @param from - Optional start date for filtering logs
 * @param to - Optional end date for filtering logs
 * @returns Object with stats data, loading state, and mutation function
 */
export function useHabitStats(
  habitId: string,
  from?: Date,
  to?: Date
): UseHabitStatsReturn {
  // Build dynamic key with optional date parameters
  const getKey = () => {
    const params = new URLSearchParams();
    if (from) {
      params.append('from', from.toISOString());
    }
    if (to) {
      params.append('to', to.toISOString());
    }
    const query = params.toString();
    return query ? `/api/habits/${habitId}/stats?${query}` : `/api/habits/${habitId}/stats`;
  };

  const { data, error, isLoading, mutate } = useSWR<HabitStats>(getKey());

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}
