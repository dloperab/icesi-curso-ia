/**
 * Unit tests for habit statistics calculation functions
 * Testing: normal cases, edge cases, and error cases
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCurrentStreak,
  calculateMaxStreak,
  calculateCompletionRate,
  getNextExpectedDate,
} from '@/lib/calculations';
import type { Habit, HabitLog } from '@/types/habits';

// ============================================================================
// Test Helpers
// ============================================================================

function createMockHabit(overrides?: Partial<Habit>): Habit {
  return {
    id: 'test-habit-id',
    name: 'Test Habit',
    description: 'Test description',
    frequency: 'daily',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

function createMockLog(completedAt: Date | string, overrides?: Partial<HabitLog>): HabitLog {
  return {
    id: `log-${Date.now()}-${Math.random()}`,
    habitId: 'test-habit-id',
    completedAt: typeof completedAt === 'string' ? new Date(completedAt) : completedAt,
    note: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

// ============================================================================
// calculateCurrentStreak Tests
// ============================================================================

describe('calculateCurrentStreak', () => {
  describe('daily habits - normal cases', () => {
    it('should return 0 for no logs', () => {
      const result = calculateCurrentStreak([], 'daily');
      expect(result).toBe(0);
    });

    it('should return 1 for single log today', () => {
      const today = new Date();
      const logs = [createMockLog(today)];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(1);
    });

    it('should return 2 for logs today and yesterday', () => {
      const today = new Date();
      const yesterday = subtractDays(today, 1);
      const logs = [
        createMockLog(today),
        createMockLog(yesterday),
      ];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(2);
    });

    it('should return 5 for consecutive 5 days including today', () => {
      const today = new Date();
      const logs = [
        createMockLog(today),
        createMockLog(subtractDays(today, 1)),
        createMockLog(subtractDays(today, 2)),
        createMockLog(subtractDays(today, 3)),
        createMockLog(subtractDays(today, 4)),
      ];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(5);
    });

    it('should return 3 for consecutive days ending yesterday (not today)', () => {
      const today = new Date();
      const yesterday = subtractDays(today, 1);
      const logs = [
        createMockLog(yesterday),
        createMockLog(subtractDays(today, 2)),
        createMockLog(subtractDays(today, 3)),
      ];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(3);
    });
  });

  describe('daily habits - edge cases', () => {
    it('should return 0 if last log was 2 days ago', () => {
      const today = new Date();
      const logs = [createMockLog(subtractDays(today, 2))];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(0);
    });

    it('should handle multiple logs on the same day', () => {
      const today = new Date();
      const yesterday = subtractDays(today, 1);
      const logs = [
        createMockLog(today),
        createMockLog(today), // Duplicate day
        createMockLog(yesterday),
      ];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(2);
    });

    it('should ignore older logs after a gap', () => {
      const today = new Date();
      const logs = [
        createMockLog(today),
        createMockLog(subtractDays(today, 1)),
        // Gap of 2 days
        createMockLog(subtractDays(today, 4)),
        createMockLog(subtractDays(today, 5)),
      ];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(2); // Only counts today and yesterday
    });

    it('should handle unsorted logs correctly', () => {
      const today = new Date();
      const logs = [
        createMockLog(subtractDays(today, 2)),
        createMockLog(today),
        createMockLog(subtractDays(today, 1)),
      ];
      const result = calculateCurrentStreak(logs, 'daily');
      expect(result).toBe(3);
    });
  });

  describe('weekly habits - normal cases', () => {
    it('should return 1 for single log this week', () => {
      const today = new Date();
      const logs = [createMockLog(today)];
      const result = calculateCurrentStreak(logs, 'weekly');
      expect(result).toBe(1);
    });

    it('should return 2 for logs in current and previous week', () => {
      const today = new Date();
      const lastWeek = subtractDays(today, 7);
      const logs = [
        createMockLog(today),
        createMockLog(lastWeek),
      ];
      const result = calculateCurrentStreak(logs, 'weekly');
      expect(result).toBe(2);
    });

    it('should return 3 for consecutive 3 weeks', () => {
      const today = new Date();
      const logs = [
        createMockLog(today),
        createMockLog(subtractDays(today, 7)),
        createMockLog(subtractDays(today, 14)),
      ];
      const result = calculateCurrentStreak(logs, 'weekly');
      expect(result).toBe(3);
    });
  });

  describe('weekly habits - edge cases', () => {
    it('should return 0 if last log was 2 weeks ago', () => {
      const today = new Date();
      const logs = [createMockLog(subtractDays(today, 15))];
      const result = calculateCurrentStreak(logs, 'weekly');
      expect(result).toBe(0);
    });

    it('should count multiple logs in same week as 1', () => {
      const today = new Date();
      const logs = [
        createMockLog(today),
        createMockLog(subtractDays(today, 2)), // Same week
        createMockLog(subtractDays(today, 7)), // Previous week
      ];
      const result = calculateCurrentStreak(logs, 'weekly');
      expect(result).toBe(2); // Only 2 weeks
    });

    it('should ignore older logs after a gap', () => {
      const today = new Date();
      const logs = [
        createMockLog(today),
        createMockLog(subtractDays(today, 7)),
        // Gap of 2 weeks
        createMockLog(subtractDays(today, 28)),
      ];
      const result = calculateCurrentStreak(logs, 'weekly');
      expect(result).toBe(2); // Only current and previous week
    });
  });
});

// ============================================================================
// calculateMaxStreak Tests
// ============================================================================

describe('calculateMaxStreak', () => {
  describe('daily habits - normal cases', () => {
    it('should return 0 for no logs', () => {
      const result = calculateMaxStreak([], 'daily');
      expect(result).toBe(0);
    });

    it('should return 1 for single log', () => {
      const logs = [createMockLog('2024-01-15')];
      const result = calculateMaxStreak(logs, 'daily');
      expect(result).toBe(1);
    });

    it('should return 5 for consecutive 5 days', () => {
      const logs = [
        createMockLog('2024-01-10'),
        createMockLog('2024-01-11'),
        createMockLog('2024-01-12'),
        createMockLog('2024-01-13'),
        createMockLog('2024-01-14'),
      ];
      const result = calculateMaxStreak(logs, 'daily');
      expect(result).toBe(5);
    });

    it('should find maximum streak among multiple streaks', () => {
      const logs = [
        // Streak 1: 3 days
        createMockLog('2024-01-01'),
        createMockLog('2024-01-02'),
        createMockLog('2024-01-03'),
        // Gap
        // Streak 2: 5 days (max)
        createMockLog('2024-01-10'),
        createMockLog('2024-01-11'),
        createMockLog('2024-01-12'),
        createMockLog('2024-01-13'),
        createMockLog('2024-01-14'),
        // Gap
        // Streak 3: 2 days
        createMockLog('2024-01-20'),
        createMockLog('2024-01-21'),
      ];
      const result = calculateMaxStreak(logs, 'daily');
      expect(result).toBe(5);
    });
  });

  describe('daily habits - edge cases', () => {
    it('should handle multiple logs on same day', () => {
      const logs = [
        createMockLog('2024-01-10'),
        createMockLog('2024-01-10'), // Duplicate
        createMockLog('2024-01-11'),
        createMockLog('2024-01-12'),
      ];
      const result = calculateMaxStreak(logs, 'daily');
      expect(result).toBe(3); // Only 3 unique days
    });

    it('should handle unsorted logs', () => {
      const logs = [
        createMockLog('2024-01-13'),
        createMockLog('2024-01-10'),
        createMockLog('2024-01-12'),
        createMockLog('2024-01-11'),
      ];
      const result = calculateMaxStreak(logs, 'daily');
      expect(result).toBe(4);
    });

    it('should handle gaps of various sizes', () => {
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-02'),
        // Gap of 5 days
        createMockLog('2024-01-08'),
        // Gap of 10 days
        createMockLog('2024-01-19'),
        createMockLog('2024-01-20'),
        createMockLog('2024-01-21'),
      ];
      const result = calculateMaxStreak(logs, 'daily');
      expect(result).toBe(3); // Last streak is longest
    });
  });

  describe('weekly habits - normal cases', () => {
    it('should return 1 for single week', () => {
      const logs = [createMockLog('2024-01-15')];
      const result = calculateMaxStreak(logs, 'weekly');
      expect(result).toBe(1);
    });

    it('should return 4 for consecutive 4 weeks', () => {
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-08'),
        createMockLog('2024-01-15'),
        createMockLog('2024-01-22'),
      ];
      const result = calculateMaxStreak(logs, 'weekly');
      expect(result).toBe(4);
    });

    it('should find maximum streak among multiple weekly streaks', () => {
      const logs = [
        // Streak 1: 2 weeks
        createMockLog('2024-01-01'),
        createMockLog('2024-01-08'),
        // Gap
        // Streak 2: 3 weeks (max)
        createMockLog('2024-02-01'),
        createMockLog('2024-02-08'),
        createMockLog('2024-02-15'),
      ];
      const result = calculateMaxStreak(logs, 'weekly');
      expect(result).toBe(3);
    });
  });

  describe('weekly habits - edge cases', () => {
    it('should count multiple logs in same week as 1', () => {
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-03'), // Same week
        createMockLog('2024-01-08'),
      ];
      const result = calculateMaxStreak(logs, 'weekly');
      expect(result).toBe(2);
    });
  });
});

// ============================================================================
// calculateCompletionRate Tests
// ============================================================================

describe('calculateCompletionRate', () => {
  describe('daily habits - normal cases', () => {
    it('should return 0 for no completions', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const result = calculateCompletionRate(habit, []);
      expect(result).toBe(0);
    });

    it('should return 100 for perfect completion', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-02'),
        createMockLog('2024-01-03'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-03')
      );
      expect(result).toBe(100);
    });

    it('should return 50 for half completion', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-03'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-04')
      );
      expect(result).toBe(50); // 2 out of 4 days
    });

    it('should calculate rate for 10 days with 7 completions', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-02'),
        createMockLog('2024-01-03'),
        createMockLog('2024-01-05'),
        createMockLog('2024-01-07'),
        createMockLog('2024-01-09'),
        createMockLog('2024-01-10'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-10')
      );
      expect(result).toBe(70); // 7 out of 10 days
    });
  });

  describe('daily habits - edge cases', () => {
    it('should cap rate at 100% even with over-completion', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-01'), // Duplicate
        createMockLog('2024-01-02'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-02')
      );
      expect(result).toBe(100);
    });

    it('should handle duplicate logs on same day', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-01'),
        createMockLog('2024-01-01'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-03')
      );
      expect(result).toBe(33); // 1 unique day out of 3
    });

    it('should default to habit createdAt if no fromDate provided', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const logs = [createMockLog('2024-01-01')];
      const result = calculateCompletionRate(
        habit,
        logs,
        undefined,
        new Date('2024-01-05')
      );
      expect(result).toBe(20); // 1 out of 5 days
    });

    it('should handle at least 1 expected completion', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'daily',
      });
      const result = calculateCompletionRate(
        habit,
        [],
        new Date('2024-01-01'),
        new Date('2024-01-01')
      );
      expect(result).toBe(0);
    });
  });

  describe('weekly habits - normal cases', () => {
    it('should return 100 for perfect weekly completion', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'weekly',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-08'),
        createMockLog('2024-01-15'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-21')
      );
      expect(result).toBe(100); // 3 weeks, 3 completions
    });

    it('should return 75 for 3 out of 4 weeks', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'weekly',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-08'),
        createMockLog('2024-01-22'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-28')
      );
      expect(result).toBe(75); // 3 out of 4 weeks
    });
  });

  describe('weekly habits - edge cases', () => {
    it('should count multiple logs in same week as 1', () => {
      const habit = createMockHabit({
        createdAt: new Date('2024-01-01'),
        frequency: 'weekly',
      });
      const logs = [
        createMockLog('2024-01-01'),
        createMockLog('2024-01-03'),
        createMockLog('2024-01-05'),
      ];
      const result = calculateCompletionRate(
        habit,
        logs,
        new Date('2024-01-01'),
        new Date('2024-01-07')
      );
      expect(result).toBe(100); // 1 week, 1 completion (even with 3 logs)
    });
  });
});

// ============================================================================
// getNextExpectedDate Tests
// ============================================================================

describe('getNextExpectedDate', () => {
  describe('daily habits - normal cases', () => {
    it('should return today if no logs exist', () => {
      const habit = createMockHabit({
        createdAt: new Date(),
        frequency: 'daily',
      });
      const result = getNextExpectedDate(habit, []);
      expect(result).not.toBeNull();
      if (result) {
        const today = new Date();
        expect(result.toDateString()).toBe(today.toDateString());
      }
    });

    it('should return null if already completed today', () => {
      const habit = createMockHabit({ frequency: 'daily' });
      const today = new Date();
      const logs = [createMockLog(today)];
      const result = getNextExpectedDate(habit, logs);
      expect(result).toBeNull();
    });

    it('should return today if last completed yesterday', () => {
      const habit = createMockHabit({ frequency: 'daily' });
      const today = new Date();
      const yesterday = subtractDays(today, 1);
      const logs = [createMockLog(yesterday)];
      const result = getNextExpectedDate(habit, logs);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.toDateString()).toBe(today.toDateString());
      }
    });

    it('should return today if last completed 3 days ago', () => {
      const habit = createMockHabit({ frequency: 'daily' });
      const today = new Date();
      const logs = [createMockLog(subtractDays(today, 3))];
      const result = getNextExpectedDate(habit, logs);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.toDateString()).toBe(today.toDateString());
      }
    });
  });

  describe('weekly habits - normal cases', () => {
    it('should return null if already completed this week', () => {
      const habit = createMockHabit({ frequency: 'weekly' });
      const today = new Date();
      const logs = [createMockLog(today)];
      const result = getNextExpectedDate(habit, logs);
      expect(result).toBeNull();
    });

    it('should return today if not completed this week', () => {
      const habit = createMockHabit({ frequency: 'weekly' });
      const today = new Date();
      const lastWeek = subtractDays(today, 7);
      const logs = [createMockLog(lastWeek)];
      const result = getNextExpectedDate(habit, logs);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.toDateString()).toBe(today.toDateString());
      }
    });
  });

  describe('edge cases', () => {
    it('should handle habit created in future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const habit = createMockHabit({
        createdAt: futureDate,
        frequency: 'daily',
      });
      const result = getNextExpectedDate(habit, []);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.toDateString()).toBe(futureDate.toDateString());
      }
    });

    it('should handle multiple logs and find most recent', () => {
      const habit = createMockHabit({ frequency: 'daily' });
      const today = new Date();
      const logs = [
        createMockLog(subtractDays(today, 5)),
        createMockLog(subtractDays(today, 1)), // Most recent
        createMockLog(subtractDays(today, 10)),
      ];
      const result = getNextExpectedDate(habit, logs);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.toDateString()).toBe(today.toDateString());
      }
    });
  });
});
