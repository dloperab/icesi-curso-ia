/**
 * TypeScript types and interfaces for Habit Tracking System
 * Aligned with Prisma schema models
 */

/**
 * Frequency enum for habit tracking
 */
export type HabitFrequency = 'daily' | 'weekly';

/**
 * Habit entity representing a user's tracked habit
 * @interface Habit
 */
export interface Habit {
  /** Unique identifier (CUID) */
  id: string;

  /** Habit name/title */
  name: string;

  /** Optional description of the habit */
  description: string | null;

  /** How often the habit should be completed */
  frequency: HabitFrequency;

  /** Timestamp when habit was created */
  createdAt: Date;

  /** Timestamp of last update */
  updatedAt: Date;

  /** Associated habit logs (optional, depends on query) */
  logs?: HabitLog[];
}

/**
 * HabitLog entity representing a single completion/check-in
 * @interface HabitLog
 */
export interface HabitLog {
  /** Unique identifier (CUID) */
  id: string;

  /** Reference to parent habit */
  habitId: string;

  /** Timestamp when habit was completed */
  completedAt: Date;

  /** Optional note about this completion */
  note: string | null;

  /** Timestamp when log was created */
  createdAt: Date;

  /** Parent habit (optional, depends on query) */
  habit?: Habit;
}

/**
 * Calculated statistics for a habit
 * Computed on-demand from habit logs
 * @interface HabitStats
 */
export interface HabitStats {
  /** Reference to habit */
  habitId: string;

  /** Current active streak count */
  currentStreak: number;

  /** Maximum streak ever achieved */
  maxStreak: number;

  /** Completion rate as percentage (0-100) */
  completionRate: number;

  /** Next expected completion date based on frequency */
  nextExpectedDate: Date | null;

  /** Total number of logs/completions */
  totalLogs: number;

  /** Associated habit logs for chart visualization (optional) */
  logs?: HabitLog[];
}

/**
 * Input type for creating a new habit
 * Omits auto-generated fields
 */
export interface CreateHabitInput {
  name: string;
  description?: string | null;
  frequency: HabitFrequency;
}

/**
 * Input type for updating an existing habit
 * All fields optional except id
 */
export interface UpdateHabitInput {
  id: string;
  name?: string;
  description?: string;
  frequency?: HabitFrequency;
}

/**
 * Input type for creating a habit log/check-in
 * Omits auto-generated fields and habitId (from URL param)
 */
export interface CreateHabitLogInput {
  note?: string;
}

/**
 * Query parameters for stats endpoint
 */
export interface StatsQueryParams {
  /** Start date for filtering logs (ISO8601) */
  from?: string;

  /** End date for filtering logs (ISO8601) */
  to?: string;
}
