/**
 * Unit tests for Zod validation schemas
 * Tests: success cases, validation failures, edge cases
 */

import { describe, it, expect } from 'vitest';
import {
  habitFrequencySchema,
  createHabitSchema,
  updateHabitSchema,
  createHabitLogSchema,
  statsQueryParamsSchema,
  habitIdParamSchema,
  validateSchema,
  safeValidateSchema,
} from '@/lib/validations';

describe('habitFrequencySchema', () => {
  it('should accept "daily" as valid frequency', () => {
    const result = habitFrequencySchema.safeParse('daily');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('daily');
    }
  });

  it('should accept "weekly" as valid frequency', () => {
    const result = habitFrequencySchema.safeParse('weekly');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('weekly');
    }
  });

  it('should reject invalid frequency value', () => {
    const result = habitFrequencySchema.safeParse('monthly');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('daily');
    }
  });

  it('should reject non-string values', () => {
    const result = habitFrequencySchema.safeParse(123);
    expect(result.success).toBe(false);
  });
});

describe('createHabitSchema', () => {
  describe('success cases', () => {
    it('should accept valid habit with all fields', () => {
      const validHabit = {
        name: 'Morning Exercise',
        description: 'Exercise for 30 minutes every morning',
        frequency: 'daily' as const,
      };
      const result = createHabitSchema.safeParse(validHabit);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validHabit);
      }
    });

    it('should accept valid habit without description', () => {
      const validHabit = {
        name: 'Read books',
        frequency: 'weekly' as const,
      };
      const result = createHabitSchema.safeParse(validHabit);
      expect(result.success).toBe(true);
    });

    it('should accept habit with null description', () => {
      const validHabit = {
        name: 'Meditation',
        description: null,
        frequency: 'daily' as const,
      };
      const result = createHabitSchema.safeParse(validHabit);
      expect(result.success).toBe(true);
    });

    it('should trim whitespace from name and description', () => {
      const habitWithWhitespace = {
        name: '  Yoga Practice  ',
        description: '  Daily yoga session  ',
        frequency: 'daily' as const,
      };
      const result = createHabitSchema.safeParse(habitWithWhitespace);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Yoga Practice');
        expect(result.data.description).toBe('Daily yoga session');
      }
    });
  });

  describe('validation failures', () => {
    it('should reject habit without name', () => {
      const invalidHabit = {
        frequency: 'daily',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
    });

    it('should reject habit with empty name', () => {
      const invalidHabit = {
        name: '',
        frequency: 'daily',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('cannot be empty');
      }
    });

    it('should reject habit with whitespace-only name', () => {
      const invalidHabit = {
        name: '   ',
        frequency: 'daily',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
    });

    it('should reject habit with name exceeding 100 characters', () => {
      const invalidHabit = {
        name: 'a'.repeat(101),
        frequency: 'daily',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100 characters');
      }
    });

    it('should reject habit with description exceeding 500 characters', () => {
      const invalidHabit = {
        name: 'Test Habit',
        description: 'a'.repeat(501),
        frequency: 'daily',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('500 characters');
      }
    });

    it('should reject habit with invalid frequency', () => {
      const invalidHabit = {
        name: 'Test Habit',
        frequency: 'monthly',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
    });

    it('should reject habit with non-string name', () => {
      const invalidHabit = {
        name: 123,
        frequency: 'daily',
      };
      const result = createHabitSchema.safeParse(invalidHabit);
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should accept habit with exactly 100 character name', () => {
      const validHabit = {
        name: 'a'.repeat(100),
        frequency: 'daily' as const,
      };
      const result = createHabitSchema.safeParse(validHabit);
      expect(result.success).toBe(true);
    });

    it('should accept habit with exactly 500 character description', () => {
      const validHabit = {
        name: 'Test Habit',
        description: 'a'.repeat(500),
        frequency: 'weekly' as const,
      };
      const result = createHabitSchema.safeParse(validHabit);
      expect(result.success).toBe(true);
    });
  });
});

describe('updateHabitSchema', () => {
  it('should accept empty update object', () => {
    const result = updateHabitSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept partial update with name only', () => {
    const update = { name: 'Updated Name' };
    const result = updateHabitSchema.safeParse(update);
    expect(result.success).toBe(true);
  });

  it('should accept partial update with description only', () => {
    const update = { description: 'Updated description' };
    const result = updateHabitSchema.safeParse(update);
    expect(result.success).toBe(true);
  });

  it('should accept partial update with frequency only', () => {
    const update = { frequency: 'weekly' };
    const result = updateHabitSchema.safeParse(update);
    expect(result.success).toBe(true);
  });

  it('should reject update with invalid name', () => {
    const update = { name: '' };
    const result = updateHabitSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it('should reject update with name exceeding 100 characters', () => {
    const update = { name: 'a'.repeat(101) };
    const result = updateHabitSchema.safeParse(update);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace when present', () => {
    const update = { name: '  Updated Name  ' };
    const result = updateHabitSchema.safeParse(update);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Updated Name');
    }
  });
});

describe('createHabitLogSchema', () => {
  it('should accept log without note', () => {
    const result = createHabitLogSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept log with valid note', () => {
    const validLog = { note: 'Completed morning session' };
    const result = createHabitLogSchema.safeParse(validLog);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe('Completed morning session');
    }
  });

  it('should accept log with null note', () => {
    const validLog = { note: null };
    const result = createHabitLogSchema.safeParse(validLog);
    expect(result.success).toBe(true);
  });

  it('should trim whitespace from note', () => {
    const logWithWhitespace = { note: '  Great session!  ' };
    const result = createHabitLogSchema.safeParse(logWithWhitespace);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).toBe('Great session!');
    }
  });

  it('should reject note exceeding 500 characters', () => {
    const invalidLog = { note: 'a'.repeat(501) };
    const result = createHabitLogSchema.safeParse(invalidLog);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500 characters');
    }
  });

  it('should accept note with exactly 500 characters', () => {
    const validLog = { note: 'a'.repeat(500) };
    const result = createHabitLogSchema.safeParse(validLog);
    expect(result.success).toBe(true);
  });
});

describe('statsQueryParamsSchema', () => {
  describe('success cases', () => {
    it('should accept empty query params', () => {
      const result = statsQueryParamsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept valid from date only', () => {
      const params = { from: '2023-01-01T00:00:00Z' };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should accept valid to date only', () => {
      const params = { to: '2023-12-31T23:59:59Z' };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should accept valid date range with from before to', () => {
      const params = {
        from: '2023-01-01T00:00:00Z',
        to: '2023-12-31T23:59:59Z',
      };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('should accept date range where from equals to', () => {
      const params = {
        from: '2023-06-15T12:00:00Z',
        to: '2023-06-15T12:00:00Z',
      };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(true);
    });
  });

  describe('validation failures', () => {
    it('should reject invalid ISO8601 date format', () => {
      const params = { from: '2023-01-01' };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('ISO8601');
      }
    });

    it('should reject date range where from is after to', () => {
      const params = {
        from: '2023-12-31T23:59:59Z',
        to: '2023-01-01T00:00:00Z',
      };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message;
        expect(errorMessage).toContain('before');
      }
    });

    it('should reject non-string date values', () => {
      const params = { from: 1672531200000 };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should reject invalid date strings', () => {
      const params = { from: 'invalid-date' };
      const result = statsQueryParamsSchema.safeParse(params);
      expect(result.success).toBe(false);
    });
  });
});

describe('habitIdParamSchema', () => {
  it('should accept valid CUID format', () => {
    const validId = { id: 'clhq0b3qi0000qzrm1z8g0b3q' };
    const result = habitIdParamSchema.safeParse(validId);
    expect(result.success).toBe(true);
  });

  it('should reject empty ID', () => {
    const invalidId = { id: '' };
    const result = habitIdParamSchema.safeParse(invalidId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required');
    }
  });

  it('should reject invalid CUID format (wrong length)', () => {
    const invalidId = { id: 'clhq0b3qi' };
    const result = habitIdParamSchema.safeParse(invalidId);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid');
    }
  });

  it('should reject CUID not starting with c', () => {
    const invalidId = { id: 'alhq0b3qi0000qzrm1z8g0b3q' };
    const result = habitIdParamSchema.safeParse(invalidId);
    expect(result.success).toBe(false);
  });

  it('should reject CUID with invalid characters', () => {
    const invalidId = { id: 'clhq0b3qi0000qzrm1z8g0B3Q' };
    const result = habitIdParamSchema.safeParse(invalidId);
    expect(result.success).toBe(false);
  });

  it('should reject missing id field', () => {
    const result = habitIdParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('validateSchema helper', () => {
  it('should return parsed data on success', () => {
    const validHabit = {
      name: 'Test Habit',
      frequency: 'daily' as const,
    };
    const result = validateSchema(createHabitSchema, validHabit);
    expect(result).toEqual(validHabit);
  });

  it('should throw ZodError on validation failure', () => {
    const invalidHabit = {
      name: '',
      frequency: 'daily',
    };
    expect(() => validateSchema(createHabitSchema, invalidHabit)).toThrow();
  });

  it('should transform data (trim whitespace)', () => {
    const habitWithWhitespace = {
      name: '  Test Habit  ',
      frequency: 'weekly' as const,
    };
    const result = validateSchema(createHabitSchema, habitWithWhitespace);
    expect(result.name).toBe('Test Habit');
  });
});

describe('safeValidateSchema helper', () => {
  it('should return success result with parsed data', () => {
    const validHabit = {
      name: 'Test Habit',
      frequency: 'daily' as const,
    };
    const result = safeValidateSchema(createHabitSchema, validHabit);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validHabit);
    }
  });

  it('should return error result on validation failure', () => {
    const invalidHabit = {
      name: '',
      frequency: 'daily',
    };
    const result = safeValidateSchema(createHabitSchema, invalidHabit);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });

  it('should not throw error on validation failure', () => {
    const invalidHabit = { frequency: 'invalid' };
    expect(() => safeValidateSchema(createHabitSchema, invalidHabit)).not.toThrow();
  });
});
