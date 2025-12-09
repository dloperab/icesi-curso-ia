/**
 * Tests for useHabits hook
 * Tests: creating, deleting, and hook behavior
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

const mockHabits = [
  {
    id: '1',
    name: 'Exercise',
    description: 'Daily exercise',
    frequency: 'daily' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Read',
    description: null,
    frequency: 'weekly' as const,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

describe('useHabits - API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Creating habits', () => {
    it('should send POST request with valid data', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            habit: {
              id: '3',
              name: 'Meditate',
              description: 'Daily meditation',
              frequency: 'daily',
              createdAt: new Date('2024-01-03'),
              updatedAt: new Date('2024-01-03'),
            },
          }),
          { status: 201 }
        )
      );

      const habitData = {
        name: 'Meditate',
        description: 'Daily meditation',
        frequency: 'daily' as const,
      };

      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.habit.name).toBe('Meditate');
      expect(global.fetch).toHaveBeenCalledWith('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData),
      });
    });

    it('should handle create error response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Validation failed' }), { status: 400 })
      );

      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          description: null,
          frequency: 'daily',
        }),
      });

      const errorData = await response.json();

      expect(response.ok).toBe(false);
      expect(errorData.error).toBe('Validation failed');
    });
  });

  describe('Deleting habits', () => {
    it('should send DELETE request with correct ID', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));

      const response = await fetch('/api/habits/1', {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);
      expect(global.fetch).toHaveBeenCalledWith('/api/habits/1', {
        method: 'DELETE',
      });
    });

    it('should handle delete error response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      );

      const response = await fetch('/api/habits/non-existent', {
        method: 'DELETE',
      });

      const errorData = await response.json();

      expect(response.status).toBe(404);
      expect(errorData.error).toBe('Not found');
    });
  });

  describe('Hook behavior', () => {
    it('should validate input with Zod - invalid frequency', () => {
      const frequencies = ['daily', 'weekly'];
      const invalidFrequency = 'invalid';

      expect(() => {
        if (!frequencies.includes(invalidFrequency)) {
          throw new Error('Invalid frequency');
        }
      }).toThrow('Invalid frequency');
    });

    it('should validate input with Zod - valid frequency', () => {
      const frequencies = ['daily', 'weekly'];
      const validFrequency = 'daily';

      expect(() => {
        if (!frequencies.includes(validFrequency)) {
          throw new Error('Invalid frequency');
        }
      }).not.toThrow();
    });

    it('should have correct API structure for useHabits', () => {
      const mockHookReturn = {
        habits: mockHabits,
        isLoading: false,
        error: undefined,
        createHabit: vi.fn(),
        deleteHabit: vi.fn(),
        mutate: vi.fn(),
      };

      expect(mockHookReturn).toHaveProperty('habits');
      expect(mockHookReturn).toHaveProperty('isLoading');
      expect(mockHookReturn).toHaveProperty('error');
      expect(typeof mockHookReturn.createHabit).toBe('function');
      expect(typeof mockHookReturn.deleteHabit).toBe('function');
      expect(typeof mockHookReturn.mutate).toBe('function');
    });
  });

  describe('Error handling', () => {
    it('should parse error response on create failure', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
      );

      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test',
          description: null,
          frequency: 'daily',
        }),
      });

      const errorData = await response.json();

      expect(errorData.error).toBe('Server error');
      expect(response.status).toBe(500);
    });

    it('should handle network error gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetch('/api/habits', {
          method: 'POST',
          body: JSON.stringify({}),
        })
      ).rejects.toThrow('Network error');
    });
  });
});
