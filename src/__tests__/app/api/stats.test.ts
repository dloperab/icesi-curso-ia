/**
 * Integration tests for /api/habits/[id]/stats endpoint
 * Tests: GET operation for retrieving calculated statistics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/habits/[id]/stats/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    habit: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock calculation functions
vi.mock('@/lib/calculations', () => ({
  calculateCurrentStreak: vi.fn(() => 3),
  calculateMaxStreak: vi.fn(() => 5),
  calculateCompletionRate: vi.fn(() => 85),
  getNextExpectedDate: vi.fn(() => new Date('2024-01-15')),
}));

describe('/api/habits/[id]/stats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/habits/[id]/stats', () => {
    it('should return stats for habit with logs', async () => {
      const habitId = 'habit-with-logs';
      const mockHabit = {
        id: habitId,
        name: 'Exercise',
        description: 'Daily exercise',
        frequency: 'daily',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        logs: [
          {
            id: 'log-1',
            habitId,
            completedAt: new Date('2024-01-14'),
            note: 'Good session',
            createdAt: new Date('2024-01-14'),
          },
          {
            id: 'log-2',
            habitId,
            completedAt: new Date('2024-01-13'),
            note: null,
            createdAt: new Date('2024-01-13'),
          },
          {
            id: 'log-3',
            habitId,
            completedAt: new Date('2024-01-12'),
            note: null,
            createdAt: new Date('2024-01-12'),
          },
        ],
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/stats`);

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.habitId).toBe(habitId);
      expect(data.currentStreak).toBe(3);
      expect(data.maxStreak).toBe(5);
      expect(data.completionRate).toBe(85);
      expect(data.nextExpectedDate).toBe('2024-01-15T00:00:00.000Z');
      expect(data.totalLogs).toBe(3);
    });

    it('should return stats for habit without logs', async () => {
      const habitId = 'habit-no-logs';
      const mockHabit = {
        id: habitId,
        name: 'New Habit',
        description: null,
        frequency: 'weekly',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        logs: [],
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/stats`);

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalLogs).toBe(0);
      expect(data.habitId).toBe(habitId);
    });

    it('should filter logs by from date', async () => {
      const habitId = 'habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Test',
        description: null,
        frequency: 'daily',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        logs: [
          {
            id: 'log-1',
            habitId,
            completedAt: new Date('2024-01-10'),
            note: null,
            createdAt: new Date('2024-01-10'),
          },
        ],
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);

      const request = new NextRequest(
        `http://localhost:3000/api/habits/${habitId}/stats?from=2024-01-05T00:00:00Z`
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });

      expect(response.status).toBe(200);
      expect(prisma.habit.findUnique).toHaveBeenCalledWith({
        where: { id: habitId },
        include: {
          logs: {
            where: {
              completedAt: {
                gte: new Date('2024-01-05T00:00:00Z'),
              },
            },
            orderBy: {
              completedAt: 'desc',
            },
          },
        },
      });
    });

    it('should filter logs by from and to dates', async () => {
      const habitId = 'habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Test',
        description: null,
        frequency: 'daily',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        logs: [],
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);

      const request = new NextRequest(
        `http://localhost:3000/api/habits/${habitId}/stats?from=2024-01-01T00:00:00Z&to=2024-01-31T23:59:59Z`
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });

      expect(response.status).toBe(200);
      expect(prisma.habit.findUnique).toHaveBeenCalledWith({
        where: { id: habitId },
        include: {
          logs: {
            where: {
              completedAt: {
                gte: new Date('2024-01-01T00:00:00Z'),
                lte: new Date('2024-01-31T23:59:59Z'),
              },
            },
            orderBy: {
              completedAt: 'desc',
            },
          },
        },
      });
    });

    it('should return 404 for non-existent habit', async () => {
      const habitId = 'non-existent';

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/stats`);

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Habit not found');
    });

    it('should return 400 for invalid date format', async () => {
      const habitId = 'habit-id';

      const request = new NextRequest(
        `http://localhost:3000/api/habits/${habitId}/stats?from=invalid-date`
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid query parameters');
      expect(prisma.habit.findUnique).not.toHaveBeenCalled();
    });

    it('should return 400 when from date is after to date', async () => {
      const habitId = 'habit-id';

      const request = new NextRequest(
        `http://localhost:3000/api/habits/${habitId}/stats?from=2024-01-31T00:00:00Z&to=2024-01-01T00:00:00Z`
      );

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid query parameters');
    });

    it('should handle database errors', async () => {
      const habitId = 'habit-id';

      vi.mocked(prisma.habit.findUnique).mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/stats`);

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch habit statistics');
    });

    it('should handle null nextExpectedDate', async () => {
      const habitId = 'habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Test',
        description: null,
        frequency: 'daily',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        logs: [],
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);

      // Mock getNextExpectedDate to return null
      const { getNextExpectedDate } = await import('@/lib/calculations');
      vi.mocked(getNextExpectedDate).mockReturnValue(null);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/stats`);

      const response = await GET(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.nextExpectedDate).toBeNull();
    });
  });
});
