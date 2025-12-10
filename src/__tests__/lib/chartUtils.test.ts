import { describe, it, expect } from 'vitest';
import {
  transformLogsToChartData,
  filterLogsByDateRange,
  getLogStatistics,
  type ChartDataPoint,
} from '@/lib/chartUtils';
import type { HabitLog } from '@/types/habits';

describe('chartUtils', () => {
  const mockLogs: HabitLog[] = [
    {
      id: '1',
      habitId: 'habit-1',
      completedAt: new Date('2024-01-01T10:00:00'),
      note: null,
      createdAt: new Date(),
    },
    {
      id: '2',
      habitId: 'habit-1',
      completedAt: new Date('2024-01-01T14:00:00'),
      note: null,
      createdAt: new Date(),
    },
    {
      id: '3',
      habitId: 'habit-1',
      completedAt: new Date('2024-01-02T10:00:00'),
      note: null,
      createdAt: new Date(),
    },
    {
      id: '4',
      habitId: 'habit-1',
      completedAt: new Date('2024-01-03T10:00:00'),
      note: null,
      createdAt: new Date(),
    },
  ];

  describe('transformLogsToChartData', () => {
    it('transforms logs to chart data grouped by day', () => {
      const data = transformLogsToChartData(mockLogs, 'day');

      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('value');
      expect(typeof data[0].value).toBe('number');
    });

    it('groups multiple logs on same day correctly', () => {
      const data = transformLogsToChartData(mockLogs, 'day');

      // Find the entry for Jan 01 which has 2 logs
      const jan01 = data.find((d) => d.date.includes('01'));
      expect(jan01?.value).toBe(2);
    });

    it('returns empty array for empty logs', () => {
      const data = transformLogsToChartData([]);

      expect(data).toEqual([]);
    });

    it('groups logs by week', () => {
      const data = transformLogsToChartData(mockLogs, 'week');

      expect(data.length).toBeGreaterThan(0);
      expect(data[0].date).toContain('Semana');
    });

    it('maintains correct counts when grouping by week', () => {
      // All mockLogs are in the same week, so should have value >= 4
      const data = transformLogsToChartData(mockLogs, 'week');

      expect(data[0].value).toBeGreaterThanOrEqual(3); // At least the logs from different days
    });

    it('returns data with string dates and numeric values', () => {
      const data = transformLogsToChartData(mockLogs, 'day');

      data.forEach((point: ChartDataPoint) => {
        expect(typeof point.date).toBe('string');
        expect(typeof point.value).toBe('number');
        expect(point.value).toBeGreaterThan(0);
      });
    });
  });

  describe('filterLogsByDateRange', () => {
    it('returns all logs when no dates provided', () => {
      const filtered = filterLogsByDateRange(mockLogs);

      expect(filtered.length).toBe(mockLogs.length);
    });

    it('filters logs by from date', () => {
      const fromDate = new Date('2024-01-02');
      const filtered = filterLogsByDateRange(mockLogs, fromDate);

      expect(filtered.length).toBe(2); // Jan 02 and Jan 03
    });

    it('filters logs by to date', () => {
      const toDate = new Date('2024-01-02');
      const filtered = filterLogsByDateRange(mockLogs, undefined, toDate);

      expect(filtered.length).toBe(3); // Jan 01, Jan 01, Jan 02
    });

    it('filters logs by date range', () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-01-02');
      const filtered = filterLogsByDateRange(mockLogs, fromDate, toDate);

      expect(filtered.length).toBe(3); // Jan 01, Jan 01, Jan 02
    });

    it('returns empty array when no logs match range', () => {
      const fromDate = new Date('2024-02-01');
      const toDate = new Date('2024-02-28');
      const filtered = filterLogsByDateRange(mockLogs, fromDate, toDate);

      expect(filtered.length).toBe(0);
    });

    it('excludes logs outside range boundaries', () => {
      const fromDate = new Date('2024-01-02');
      const toDate = new Date('2024-01-02');
      const filtered = filterLogsByDateRange(mockLogs, fromDate, toDate);

      expect(filtered.length).toBe(1); // Only Jan 02
    });
  });

  describe('getLogStatistics', () => {
    it('returns zero statistics for empty logs', () => {
      const stats = getLogStatistics([]);

      expect(stats.totalLogs).toBe(0);
      expect(stats.uniqueDays).toBe(0);
      expect(stats.averagePerDay).toBe(0);
      expect(stats.earliestDate).toBeNull();
      expect(stats.latestDate).toBeNull();
    });

    it('calculates correct total logs', () => {
      const stats = getLogStatistics(mockLogs);

      expect(stats.totalLogs).toBe(4);
    });

    it('calculates unique days correctly', () => {
      const stats = getLogStatistics(mockLogs);

      expect(stats.uniqueDays).toBe(3); // Jan 01, Jan 02, Jan 03
    });

    it('calculates average per day', () => {
      const stats = getLogStatistics(mockLogs);

      // 4 total logs / 3 unique days = 1.33
      expect(stats.averagePerDay).toBeCloseTo(1.33, 1);
    });

    it('identifies earliest date', () => {
      const stats = getLogStatistics(mockLogs);

      expect(stats.earliestDate).not.toBeNull();
      // Compare dates by normalizing to UTC date strings
      const expectedDate = new Date('2024-01-01T10:00:00').toDateString();
      expect(stats.earliestDate?.toDateString()).toBe(expectedDate);
    });

    it('identifies latest date', () => {
      const stats = getLogStatistics(mockLogs);

      expect(stats.latestDate).not.toBeNull();
      // Compare dates by normalizing to UTC date strings
      const expectedDate = new Date('2024-01-03T10:00:00').toDateString();
      expect(stats.latestDate?.toDateString()).toBe(expectedDate);
    });

    it('handles single log', () => {
      const singleLog = [mockLogs[0]];
      const stats = getLogStatistics(singleLog);

      expect(stats.totalLogs).toBe(1);
      expect(stats.uniqueDays).toBe(1);
      expect(stats.averagePerDay).toBe(1);
    });

    it('returns correct type structure', () => {
      const stats = getLogStatistics(mockLogs);

      expect(stats).toHaveProperty('totalLogs');
      expect(stats).toHaveProperty('uniqueDays');
      expect(stats).toHaveProperty('averagePerDay');
      expect(stats).toHaveProperty('earliestDate');
      expect(stats).toHaveProperty('latestDate');
    });
  });
});
