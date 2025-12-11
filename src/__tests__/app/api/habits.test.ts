/**
 * Integration tests for /api/habits endpoints
 * Tests: GET, POST, DELETE operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/habits/route';
import { DELETE } from '@/app/api/habits/[id]/route';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    habit: {
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('/api/habits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/habits', () => {
    it('should return empty array when no habits exist', async () => {
      vi.mocked(prisma.habit.findMany).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.habits).toEqual([]);
      expect(prisma.habit.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return habits ordered by createdAt desc', async () => {
      const mockHabits = [
        {
          id: 'habit-2',
          name: 'Exercise',
          description: 'Daily exercise',
          frequency: 'daily',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
        {
          id: 'habit-1',
          name: 'Read',
          description: 'Read books',
          frequency: 'weekly',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      vi.mocked(prisma.habit.findMany).mockResolvedValue(mockHabits);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.habits).toHaveLength(2);
      expect(data.habits[0].id).toBe('habit-2');
    });

    it('should handle database errors', async () => {
      vi.mocked(prisma.habit.findMany).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch habits');
    });
  });

  describe('POST /api/habits', () => {
    it('should create habit with valid data', async () => {
      const newHabit = {
        name: 'Morning Meditation',
        description: 'Meditate for 10 minutes',
        frequency: 'daily' as const,
      };

      const createdHabit = {
        id: 'new-habit-id',
        ...newHabit,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.habit.create).mockResolvedValue(createdHabit);

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(newHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.habit.id).toBe('new-habit-id');
      expect(data.habit.name).toBe('Morning Meditation');
      expect(prisma.habit.create).toHaveBeenCalledWith({
        data: {
          name: 'Morning Meditation',
          description: 'Meditate for 10 minutes',
          frequency: 'daily',
        },
      });
    });

    it('should create habit without description', async () => {
      const newHabit = {
        name: 'Yoga',
        frequency: 'weekly' as const,
      };

      const createdHabit = {
        id: 'yoga-habit-id',
        name: 'Yoga',
        description: null,
        frequency: 'weekly',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.habit.create).mockResolvedValue(createdHabit);

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(newHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.habit.description).toBeNull();
    });

    it('should reject habit without name', async () => {
      const invalidHabit = {
        frequency: 'daily',
      };

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(invalidHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
      expect(prisma.habit.create).not.toHaveBeenCalled();
    });

    it('should reject habit with empty name', async () => {
      const invalidHabit = {
        name: '',
        frequency: 'daily',
      };

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(invalidHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject habit with invalid frequency', async () => {
      const invalidHabit = {
        name: 'Test Habit',
        frequency: 'monthly',
      };

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(invalidHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should reject habit with name exceeding 100 characters', async () => {
      const invalidHabit = {
        name: 'a'.repeat(101),
        frequency: 'daily',
      };

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(invalidHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
    });

    it('should handle database errors', async () => {
      const newHabit = {
        name: 'Test',
        frequency: 'daily' as const,
      };

      vi.mocked(prisma.habit.create).mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/habits', {
        method: 'POST',
        body: JSON.stringify(newHabit),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create habit');
    });
  });

  describe('DELETE /api/habits/[id]', () => {
    it('should delete existing habit', async () => {
      vi.mocked(prisma.habit.delete).mockResolvedValue({
        id: 'habit-to-delete',
        name: 'Old Habit',
        description: null,
        frequency: 'daily',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/habits/habit-to-delete', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'habit-to-delete' }),
      });

      expect(response.status).toBe(204);
      expect(prisma.habit.delete).toHaveBeenCalledWith({
        where: { id: 'habit-to-delete' },
      });
    });

    it('should return 404 for non-existent habit', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      vi.mocked(prisma.habit.delete).mockRejectedValue(prismaError);

      const request = new NextRequest('http://localhost:3000/api/habits/non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'non-existent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Habit not found');
    });

    it('should handle database errors', async () => {
      vi.mocked(prisma.habit.delete).mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest('http://localhost:3000/api/habits/some-id', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'some-id' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete habit');
    });
  });
});
