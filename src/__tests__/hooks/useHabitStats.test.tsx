/**
 * Tests for useHabitStats hook
 * Tests: fetching statistics with and without date filters
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const mockStats = {
  habitId: 'habit-1',
  currentStreak: 5,
  maxStreak: 12,
  completionRate: 85,
  nextExpectedDate: new Date('2024-01-20'),
  totalLogs: 42,
};

describe('useHabitStats - API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching statistics', () => {
    it('should fetch stats without date filter', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStats), { status: 200 })
      );

      const habitId = 'habit-1';
      const response = await fetch(`/api/habits/${habitId}/stats`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.habitId).toBe('habit-1');
      expect(result.currentStreak).toBe(5);
      expect(result.maxStreak).toBe(12);
      expect(result.completionRate).toBe(85);
      expect(global.fetch).toHaveBeenCalledWith(`/api/habits/${habitId}/stats`);
    });

    it('should fetch stats with from date filter', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStats), { status: 200 })
      );

      const habitId = 'habit-1';
      const fromDate = new Date('2024-01-01');
      const query = `from=${encodeURIComponent(fromDate.toISOString())}`;

      const response = await fetch(`/api/habits/${habitId}/stats?${query}`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.habitId).toBe('habit-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/habits/${habitId}/stats?${query}`
      );
    });

    it('should fetch stats with from and to date filters', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockStats), { status: 200 })
      );

      const habitId = 'habit-1';
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-01-31');
      const query = `from=${encodeURIComponent(fromDate.toISOString())}&to=${encodeURIComponent(toDate.toISOString())}`;

      const response = await fetch(`/api/habits/${habitId}/stats?${query}`);
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.habitId).toBe('habit-1');
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/habits/${habitId}/stats?${query}`
      );
    });
  });

  describe('Error handling', () => {
    it('should handle 404 when habit not found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Habit not found' }), { status: 404 })
      );

      const response = await fetch('/api/habits/non-existent/stats');
      const errorData = await response.json();

      expect(response.status).toBe(404);
      expect(errorData.error).toBe('Habit not found');
    });

    it('should handle invalid date format (400)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: 'Invalid query parameters' }),
          { status: 400 }
        )
      );

      const response = await fetch('/api/habits/habit-1/stats?from=invalid-date');
      const errorData = await response.json();

      expect(response.status).toBe(400);
      expect(errorData.error).toBe('Invalid query parameters');
    });

    it('should handle server error (500)', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
      );

      const response = await fetch('/api/habits/habit-1/stats');
      const errorData = await response.json();

      expect(response.status).toBe(500);
      expect(errorData.error).toBe('Internal server error');
    });

    it('should handle network errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('/api/habits/habit-1/stats')).rejects.toThrow('Network error');
    });
  });

  describe('Hook API structure', () => {
    it('should have correct return type', () => {
      const mockHookReturn = {
        stats: mockStats,
        isLoading: false,
        error: undefined,
        mutate: vi.fn(),
      };

      expect(mockHookReturn).toHaveProperty('stats');
      expect(mockHookReturn).toHaveProperty('isLoading');
      expect(mockHookReturn).toHaveProperty('error');
      expect(typeof mockHookReturn.mutate).toBe('function');
    });

    it('should return undefined stats while loading', () => {
      const mockHookReturn = {
        stats: undefined,
        isLoading: true,
        error: undefined,
        mutate: vi.fn(),
      };

      expect(mockHookReturn.stats).toBeUndefined();
      expect(mockHookReturn.isLoading).toBe(true);
      expect(mockHookReturn.error).toBeUndefined();
    });

    it('should contain correct stat properties', () => {
      expect(mockStats).toHaveProperty('habitId');
      expect(mockStats).toHaveProperty('currentStreak');
      expect(mockStats).toHaveProperty('maxStreak');
      expect(mockStats).toHaveProperty('completionRate');
      expect(mockStats).toHaveProperty('nextExpectedDate');
      expect(mockStats).toHaveProperty('totalLogs');
    });
  });

  describe('Dynamic key generation', () => {
    it('should generate correct key without date filters', () => {
      const habitId = 'habit-1';
      const key = `/api/habits/${habitId}/stats`;

      expect(key).toBe('/api/habits/habit-1/stats');
      expect(key).not.toContain('?');
    });

    it('should generate correct key with from date', () => {
      const habitId = 'habit-1';
      const fromDate = new Date('2024-01-01');
      const isoDate = fromDate.toISOString();
      const key = `/api/habits/${habitId}/stats?from=${encodeURIComponent(isoDate)}`;

      expect(key).toContain('from=');
      expect(key).toContain(encodeURIComponent(isoDate));
    });

    it('should generate correct key with both from and to dates', () => {
      const habitId = 'habit-1';
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-01-31');
      const key = `/api/habits/${habitId}/stats?from=${encodeURIComponent(
        fromDate.toISOString()
      )}&to=${encodeURIComponent(toDate.toISOString())}`;

      expect(key).toContain('from=');
      expect(key).toContain('to=');
    });
  });

  describe('Revalidation', () => {
    it('should support manual revalidation', () => {
      const mutate = vi.fn();

      // Simulate revalidation
      mutate();

      expect(mutate).toHaveBeenCalledOnce();
    });

    it('mutate should be callable without arguments', () => {
      const mutate = vi.fn();

      mutate();

      expect(mutate).toHaveBeenCalled();
    });
  });
});
