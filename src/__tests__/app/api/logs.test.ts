/**
 * Integration tests for /api/habits/[id]/logs endpoint
 * Tests: POST operation for creating habit logs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/habits/[id]/logs/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    habit: {
      findUnique: vi.fn(),
    },
    habitLog: {
      create: vi.fn(),
    },
  },
}));

describe('/api/habits/[id]/logs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/habits/[id]/logs', () => {
    it('should create log for existing habit', async () => {
      const habitId = 'existing-habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Exercise',
        description: 'Daily exercise',
        frequency: 'daily',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLog = {
        id: 'new-log-id',
        habitId,
        completedAt: new Date(),
        note: 'Great session!',
        createdAt: new Date(),
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);
      vi.mocked(prisma.habitLog.create).mockResolvedValue(mockLog);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ note: 'Great session!' }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.log.id).toBe('new-log-id');
      expect(data.log.note).toBe('Great session!');
      expect(prisma.habitLog.create).toHaveBeenCalledWith({
        data: {
          habitId,
          note: 'Great session!',
        },
      });
    });

    it('should create log without note', async () => {
      const habitId = 'habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Reading',
        description: null,
        frequency: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLog = {
        id: 'log-id',
        habitId,
        completedAt: new Date(),
        note: null,
        createdAt: new Date(),
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);
      vi.mocked(prisma.habitLog.create).mockResolvedValue(mockLog);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.log.note).toBeNull();
    });

    it('should return 404 for non-existent habit', async () => {
      const habitId = 'non-existent-habit';

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(null);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ note: 'Test' }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Habit not found');
      expect(prisma.habitLog.create).not.toHaveBeenCalled();
    });

    it('should return 409 for duplicate log (unique constraint)', async () => {
      const habitId = 'habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Exercise',
        description: null,
        frequency: 'daily',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);

      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });

      vi.mocked(prisma.habitLog.create).mockRejectedValue(prismaError);

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ note: 'Duplicate' }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Log already exists');
    });

    it('should reject note exceeding 500 characters', async () => {
      const habitId = 'habit-id';

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({ note: 'a'.repeat(501) }),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(prisma.habit.findUnique).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const habitId = 'habit-id';
      const mockHabit = {
        id: habitId,
        name: 'Test',
        description: null,
        frequency: 'daily',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.habit.findUnique).mockResolvedValue(mockHabit);
      vi.mocked(prisma.habitLog.create).mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest(`http://localhost:3000/api/habits/${habitId}/logs`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: habitId }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create habit log');
    });
  });
});
