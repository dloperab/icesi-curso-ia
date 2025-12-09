/**
 * Business logic for habit statistics calculations
 * All functions compute statistics on-demand from habit logs
 */

import type { Habit, HabitLog, HabitFrequency } from '@/types/habits';

/**
 * Calculates the current active streak for a habit
 * 
 * Algorithm:
 * 1. Sort logs by completedAt descending (most recent first)
 * 2. For daily habits: count consecutive days with logs
 * 3. For weekly habits: count consecutive weeks with at least one log
 * 4. Break streak if gap exceeds frequency threshold
 * 
 * @param logs - Array of habit logs sorted by completedAt (descending)
 * @param frequency - Habit frequency ('daily' or 'weekly')
 * @returns Current streak count (0 if no active streak)
 * 
 * @example
 * // Daily habit with logs for today, yesterday, and 2 days ago
 * calculateCurrentStreak(logs, 'daily') // Returns 3
 * 
 * @example
 * // Weekly habit with logs in current and previous week
 * calculateCurrentStreak(logs, 'weekly') // Returns 2
 */
export function calculateCurrentStreak(
  logs: HabitLog[],
  frequency: HabitFrequency
): number {
  if (logs.length === 0) return 0;

  // Sort logs by completedAt descending (most recent first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const now = new Date();
  const mostRecentLog = new Date(sortedLogs[0].completedAt);

  // Check if streak is still active based on frequency
  if (frequency === 'daily') {
    const daysSinceLastLog = getDaysDifference(mostRecentLog, now);
    // Streak broken if more than 1 day passed (allowing today or yesterday)
    if (daysSinceLastLog > 1) return 0;

    // Count consecutive days from most recent
    let streak = 0;
    const seenDays = new Set<string>();

    for (const log of sortedLogs) {
      const logDate = new Date(log.completedAt);
      const dateStr = logDate.toISOString().split('T')[0];

      // Skip duplicates
      if (seenDays.has(dateStr)) continue;
      seenDays.add(dateStr);

      const daysDiff = getDaysDifference(logDate, now);

      // Check if this day fits in the streak (0, 1, 2, 3... consecutive days)
      if (daysDiff === streak || daysDiff === streak + 1) {
        streak++;
      } else {
        // Gap found, stop
        break;
      }
    }

    return streak;
  } else {
    // weekly
    const weeksSinceLastLog = getWeeksDifference(mostRecentLog, now);
    // Streak broken if more than 1 week passed
    if (weeksSinceLastLog > 1) return 0;

    let streak = 0;
    const seenWeeks = new Set<number>();

    for (const log of sortedLogs) {
      const logDate = new Date(log.completedAt);
      const weekNum = getWeekNumber(logDate);

      // Skip duplicates
      if (seenWeeks.has(weekNum)) continue;
      seenWeeks.add(weekNum);

      const nowWeek = getWeekNumber(now);
      const expectedWeek = nowWeek - streak;

      // Check if this week fits in the streak
      if (weekNum === expectedWeek || weekNum === expectedWeek - 1) {
        streak++;
      } else {
        // Gap found, stop
        break;
      }
    }

    return streak;
  }
}

/**
 * Calculates the maximum streak ever achieved for a habit
 * 
 * Algorithm:
 * 1. Sort logs by completedAt ascending (oldest first)
 * 2. Iterate through logs counting consecutive periods
 * 3. Track the maximum streak found
 * 4. Reset current streak when gap exceeds threshold
 * 
 * @param logs - Array of habit logs
 * @param frequency - Habit frequency ('daily' or 'weekly')
 * @returns Maximum streak count achieved (0 if no logs)
 * 
 * @example
 * // Habit with multiple streaks: 5 days, break, 8 days, break, 3 days
 * calculateMaxStreak(logs, 'daily') // Returns 8
 */
export function calculateMaxStreak(
  logs: HabitLog[],
  frequency: HabitFrequency
): number {
  if (logs.length === 0) return 0;

  // Sort logs by completedAt ascending (oldest first)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  for (const log of sortedLogs) {
    const logDate = new Date(log.completedAt);

    if (lastDate === null) {
      // First log
      currentStreak = 1;
      lastDate = logDate;
    } else {
      if (frequency === 'daily') {
        const daysDiff = getDaysDifference(lastDate, logDate);

        if (daysDiff === 0) {
          // Same day, don't increment (duplicate day)
          continue;
        } else if (daysDiff === 1) {
          // Consecutive day
          currentStreak++;
          lastDate = logDate;
        } else {
          // Gap found, reset streak
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
          lastDate = logDate;
        }
      } else {
        // weekly
        const weeksDiff = getWeeksDifference(lastDate, logDate);

        if (weeksDiff === 0) {
          // Same week, don't increment
          continue;
        } else if (weeksDiff === 1) {
          // Consecutive week
          currentStreak++;
          lastDate = logDate;
        } else {
          // Gap found, reset streak
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
          lastDate = logDate;
        }
      }
    }
  }

  // Check final streak
  maxStreak = Math.max(maxStreak, currentStreak);

  return maxStreak;
}

/**
 * Calculates the completion rate for a habit within a time period
 * 
 * Algorithm:
 * 1. Determine time period (from habit creation to now, or custom range)
 * 2. Calculate expected completions based on frequency
 * 3. Count actual completions (unique dates/weeks)
 * 4. Return percentage: (actual / expected) * 100
 * 
 * @param habit - The habit object with createdAt date
 * @param logs - Array of habit logs within the period
 * @param fromDate - Optional start date (defaults to habit.createdAt)
 * @param toDate - Optional end date (defaults to now)
 * @returns Completion rate as percentage (0-100), capped at 100
 * 
 * @example
 * // Habit created 10 days ago (daily), completed 7 times
 * calculateCompletionRate(habit, logs) // Returns 70
 * 
 * @example
 * // Weekly habit, 4 weeks elapsed, 3 completions
 * calculateCompletionRate(habit, logs) // Returns 75
 */
export function calculateCompletionRate(
  habit: Habit,
  logs: HabitLog[],
  fromDate?: Date,
  toDate?: Date
): number {
  const from = fromDate || new Date(habit.createdAt);
  const to = toDate || new Date();

  // Calculate expected completions based on frequency
  let expectedCompletions: number;

  if (habit.frequency === 'daily') {
    expectedCompletions = getDaysDifference(from, to) + 1; // +1 to include both days
  } else {
    // weekly
    expectedCompletions = getWeeksDifference(from, to) + 1; // +1 to include both weeks
  }

  // Ensure at least 1 expected completion
  if (expectedCompletions < 1) expectedCompletions = 1;

  // Count actual completions (unique days/weeks)
  const actualCompletions = countUniqueCompletions(logs, habit.frequency);

  // Calculate percentage, capped at 100%
  const rate = (actualCompletions / expectedCompletions) * 100;
  return Math.min(Math.round(rate), 100);
}

/**
 * Calculates the next expected completion date for a habit
 * 
 * Algorithm:
 * 1. Find most recent log
 * 2. For daily habits: add 1 day to most recent log
 * 3. For weekly habits: add 7 days to most recent log
 * 4. If no logs exist, return habit creation date
 * 5. If calculated date is in the past, return current date
 * 
 * @param habit - The habit object
 * @param logs - Array of habit logs
 * @returns Next expected completion date, or null if habit is complete for today/week
 * 
 * @example
 * // Daily habit, last completed yesterday
 * getNextExpectedDate(habit, logs) // Returns today's date
 * 
 * @example
 * // Weekly habit, last completed 3 days ago (same week)
 * getNextExpectedDate(habit, logs) // Returns start of next week
 */
export function getNextExpectedDate(
  habit: Habit,
  logs: HabitLog[]
): Date | null {
  const now = new Date();

  if (logs.length === 0) {
    // No logs yet, expected date is habit creation date or now
    const createdAt = new Date(habit.createdAt);
    return createdAt > now ? createdAt : now;
  }

  // Sort logs by completedAt descending to get most recent
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  const mostRecentLog = new Date(sortedLogs[0].completedAt);

  if (habit.frequency === 'daily') {
    // Check if already completed today
    if (getDaysDifference(mostRecentLog, now) === 0) {
      return null; // Already completed today
    }
    // Next expected is today if last completion was yesterday or earlier
    return now;
  } else {
    // weekly
    // Check if already completed this week
    const nowWeek = getWeekNumber(now);
    const logWeek = getWeekNumber(mostRecentLog);

    if (nowWeek === logWeek) {
      return null; // Already completed this week
    }
    // Not completed this week, expected is now
    return now;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates the difference in days between two dates (ignoring time)
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Absolute number of days between dates
 */
function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Reset time to midnight for accurate day comparison
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Calculates the difference in weeks between two dates
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of weeks between dates (can be negative)
 */
function getWeeksDifference(date1: Date, date2: Date): number {
  const daysDiff = getDaysDifference(date1, date2);
  return Math.floor(daysDiff / 7);
}

/**
 * Gets the week number for a date (ISO week number)
 * 
 * @param date - Date to get week number for
 * @returns Week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo + d.getFullYear() * 52; // Make unique across years
}

/**
 * Counts unique completions (unique days for daily, unique weeks for weekly)
 * 
 * @param logs - Array of habit logs
 * @param frequency - Habit frequency
 * @returns Number of unique completion periods
 */
function countUniqueCompletions(
  logs: HabitLog[],
  frequency: HabitFrequency
): number {
  if (logs.length === 0) return 0;

  const uniquePeriods = new Set<string>();

  for (const log of logs) {
    const date = new Date(log.completedAt);

    if (frequency === 'daily') {
      // Use date string (YYYY-MM-DD) as unique identifier
      const dateStr = date.toISOString().split('T')[0];
      uniquePeriods.add(dateStr);
    } else {
      // weekly - use week number as unique identifier
      const weekNum = getWeekNumber(date);
      uniquePeriods.add(weekNum.toString());
    }
  }

  return uniquePeriods.size;
}
