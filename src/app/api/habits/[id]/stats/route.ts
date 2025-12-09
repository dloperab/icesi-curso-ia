/**
 * API Route handler for /api/habits/[id]/stats
 * Handles retrieving calculated statistics for a habit
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { statsQueryParamsSchema } from '@/lib/validations';
import {
  calculateCurrentStreak,
  calculateMaxStreak,
  calculateCompletionRate,
  getNextExpectedDate,
} from '@/lib/calculations';
import { ZodError } from 'zod';

/**
 * GET /api/habits/[id]/stats
 * Retrieves calculated statistics for a habit
 * Supports optional query parameters: from (ISO8601), to (ISO8601)
 * 
 * @param request - Next.js request object with query params
 * @param params - Route parameters containing habit ID
 * @returns JSON response with stats object or error (400/404/500)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: habitId } = await params;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
    };

    const validatedParams = statsQueryParamsSchema.parse(queryParams);

    // Fetch habit with logs
    const dateFilter: {
      completedAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (validatedParams.from || validatedParams.to) {
      dateFilter.completedAt = {};
      if (validatedParams.from) {
        dateFilter.completedAt.gte = new Date(validatedParams.from);
      }
      if (validatedParams.to) {
        dateFilter.completedAt.lte = new Date(validatedParams.to);
      }
    }

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        logs: {
          where: dateFilter,
          orderBy: {
            completedAt: 'desc',
          },
        },
      },
    });

    if (!habit) {
      return NextResponse.json(
        { error: 'Habit not found' },
        { status: 404 }
      );
    }

    // Calculate statistics using business logic functions
    const frequency = habit.frequency as 'daily' | 'weekly';
    const currentStreak = calculateCurrentStreak(habit.logs, frequency);
    const maxStreak = calculateMaxStreak(habit.logs, frequency);
    const completionRate = calculateCompletionRate(
      {
        ...habit,
        frequency,
      },
      habit.logs,
      validatedParams.from ? new Date(validatedParams.from) : undefined,
      validatedParams.to ? new Date(validatedParams.to) : undefined
    );
    const nextExpectedDate = getNextExpectedDate(
      {
        ...habit,
        frequency,
      },
      habit.logs
    );
    const totalLogs = habit.logs.length;

    // Construct stats response
    const stats = {
      habitId: habit.id,
      currentStreak,
      maxStreak,
      completionRate,
      nextExpectedDate: nextExpectedDate ? nextExpectedDate.toISOString() : null,
      totalLogs,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    // Handle Zod validation errors (invalid query params)
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Error fetching habit stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit statistics' },
      { status: 500 }
    );
  }
}
