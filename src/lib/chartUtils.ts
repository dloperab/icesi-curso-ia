/**
 * Chart utilities for transforming habit logs into chart-compatible data
 * Provides functions for grouping logs by day or week for visualization
 */

import type { HabitLog } from '@/types/habits';

/**
 * Data point format for Recharts
 */
export interface ChartDataPoint {
  /** Date label for the data point */
  date: string;
  /** Numerical value (count of completions) */
  value: number;
}

/**
 * Transform habit logs into chart data grouped by day
 * Each day gets a count of how many completions happened that day
 *
 * @param logs - Array of habit logs
 * @returns Array of chart data points grouped by day
 * @example
 * const logs = [
 *   { completedAt: new Date('2024-01-01') },
 *   { completedAt: new Date('2024-01-01') },
 *   { completedAt: new Date('2024-01-02') },
 * ];
 * const data = transformLogsToChartData(logs, 'day');
 * // Result: [
 * //   { date: 'Jan 01', value: 2 },
 * //   { date: 'Jan 02', value: 1 }
 * // ]
 */
export function transformLogsToChartData(
  logs: HabitLog[],
  groupBy: 'day' | 'week' = 'day'
): ChartDataPoint[] {
  if (!logs || logs.length === 0) {
    return [];
  }

  // Group logs by date
  const grouped: Record<string, number> = {};

  logs.forEach((log) => {
    const date = new Date(log.completedAt);
    let key: string;

    if (groupBy === 'day') {
      // Format: "Jan 01"
      key = date.toLocaleDateString('es-ES', { month: 'short', day: '2-digit' });
    } else {
      // For week, use ISO week number and year
      const weekStart = getWeekStart(date);
      key = `Semana ${getWeekNumber(weekStart)}`;
    }

    grouped[key] = (grouped[key] || 0) + 1;
  });

  // Convert to chart data format, maintaining order
  const result: ChartDataPoint[] = Object.entries(grouped).map(([date, value]) => ({
    date,
    value,
  }));

  return result;
}

/**
 * Get the start date of the week for a given date
 * Week starts on Monday
 *
 * @param date - Date to get week start for
 * @returns Date object representing Monday of that week
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Get the ISO week number for a given date
 * Follows ISO 8601 standard
 *
 * @param date - Date to get week number for
 * @returns Week number (1-53)
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Filter logs by date range
 * Useful for limiting chart data to specific time periods
 *
 * @param logs - Array of habit logs
 * @param from - Start date (inclusive)
 * @param to - End date (inclusive)
 * @returns Filtered array of logs within the date range
 */
export function filterLogsByDateRange(
  logs: HabitLog[],
  from?: Date,
  to?: Date
): HabitLog[] {
  if (!from && !to) {
    return logs;
  }

  return logs.filter((log) => {
    // Use UTC date for comparison to avoid timezone issues
    const logDate = new Date(log.completedAt);
    const logDateStr = logDate.getUTCFullYear() + '-' +
      String(logDate.getUTCMonth() + 1).padStart(2, '0') + '-' +
      String(logDate.getUTCDate()).padStart(2, '0');

    if (from) {
      const fromDateStr = from.getUTCFullYear() + '-' +
        String(from.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(from.getUTCDate()).padStart(2, '0');
      if (logDateStr < fromDateStr) return false;
    }

    if (to) {
      const toDateStr = to.getUTCFullYear() + '-' +
        String(to.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(to.getUTCDate()).padStart(2, '0');
      if (logDateStr > toDateStr) return false;
    }

    return true;
  });
}

/**
 * Get statistics about logs in a date range
 * Useful for summary information alongside charts
 *
 * @param logs - Array of habit logs
 * @returns Object with statistics
 */
export interface LogStatistics {
  /** Total number of logs */
  totalLogs: number;
  /** Number of unique days with logs */
  uniqueDays: number;
  /** Average logs per day */
  averagePerDay: number;
  /** Date of earliest log */
  earliestDate: Date | null;
  /** Date of latest log */
  latestDate: Date | null;
}

export function getLogStatistics(logs: HabitLog[]): LogStatistics {
  if (!logs || logs.length === 0) {
    return {
      totalLogs: 0,
      uniqueDays: 0,
      averagePerDay: 0,
      earliestDate: null,
      latestDate: null,
    };
  }

  // Get unique days
  const uniqueDaysSet = new Set<string>();
  logs.forEach((log) => {
    const date = new Date(log.completedAt).toDateString();
    uniqueDaysSet.add(date);
  });

  const uniqueDays = uniqueDaysSet.size;
  const totalLogs = logs.length;
  const averagePerDay = uniqueDays > 0 ? totalLogs / uniqueDays : 0;

  // Get date range
  const dates = logs.map((log) => new Date(log.completedAt));
  const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  return {
    totalLogs,
    uniqueDays,
    averagePerDay: Math.round(averagePerDay * 100) / 100,
    earliestDate,
    latestDate,
  };
}
