/**
 * Zod validation schemas for Habit Tracking System
 * Runtime validation with TypeScript type inference
 */

import { z } from 'zod';

/**
 * Schema for habit frequency
 */
export const habitFrequencySchema = z.enum(['daily', 'weekly'],
  'Frequency must be either "daily" or "weekly"'
);

/**
 * Schema for creating a new habit
 * Validates: name (required, 1-100 chars), description (optional, max 500 chars), frequency
 */
export const createHabitSchema = z.object({
  name: z
    .string('Habit name must be a string')
    .trim()
    .min(1, 'Habit name cannot be empty')
    .max(100, 'Habit name must be 100 characters or less'),

  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),

  frequency: habitFrequencySchema,
});/**
 * Infer TypeScript type from schema
 */
export type CreateHabitInput = z.infer<typeof createHabitSchema>;

/**
 * Schema for updating an existing habit
 * All fields optional except validation rules apply when present
 */
export const updateHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Habit name cannot be empty')
    .max(100, 'Habit name must be 100 characters or less')
    .optional(),

  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),

  frequency: habitFrequencySchema.optional(),
});/**
 * Infer TypeScript type from schema
 */
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;

/**
 * Schema for creating a habit log/check-in
 * Note is optional, completedAt will be auto-generated server-side
 */
export const createHabitLogSchema = z.object({
  note: z
    .string()
    .max(500, 'Note must be 500 characters or less')
    .trim()
    .optional()
    .nullable(),
});

/**
 * Infer TypeScript type from schema
 */
export type CreateHabitLogInput = z.infer<typeof createHabitLogSchema>;

/**
 * Schema for stats query parameters
 * Validates optional ISO8601 date strings
 */
export const statsQueryParamsSchema = z.object({
  from: z
    .string()
    .datetime({ message: 'Invalid date format. Use ISO8601 (e.g., 2023-01-01T00:00:00Z)' })
    .optional(),

  to: z
    .string()
    .datetime({ message: 'Invalid date format. Use ISO8601 (e.g., 2023-12-31T23:59:59Z)' })
    .optional(),
}).refine(
  (data) => {
    // If both dates provided, validate that 'from' is before 'to'
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  },
  {
    message: '"from" date must be before or equal to "to" date',
  }
);

/**
 * Infer TypeScript type from schema
 */
export type StatsQueryParams = z.infer<typeof statsQueryParamsSchema>;

/**
 * Schema for validating habit ID parameter (CUID format)
 */
export const habitIdParamSchema = z.object({
  id: z
    .string()
    .min(1, 'Habit ID is required')
    .regex(/^c[a-z0-9]{24}$/, 'Invalid habit ID format'),
});

/**
 * Helper function to validate and parse data with Zod schema
 * Returns parsed data or throws ZodError with validation details
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Parsed and validated data
 * @throws ZodError if validation fails
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Helper function to safely validate data without throwing
 * Returns result object with success status and data/error
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns SafeParseResult with success flag and data or error
 */
export function safeValidateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
) {
  return schema.safeParse(data);
}
