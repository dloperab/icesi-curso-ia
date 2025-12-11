/**
 * API Route handlers for /api/habits
 * Handles listing and creating habits
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHabitSchema } from '@/lib/validations';
import { ZodError } from 'zod';

/**
 * GET /api/habits
 * Lists all habits ordered by createdAt descending
 * 
 * @returns JSON response with habits array
 */
export async function GET() {
  try {
    const habits = await prisma.habit.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ habits }, { status: 200 });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 * Creates a new habit with validation
 * 
 * @param request - Next.js request object with JSON body
 * @returns JSON response with created habit (201) or error (400/500)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createHabitSchema.parse(body);

    // Create habit in database
    const habit = await prisma.habit.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        frequency: validatedData.frequency,
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}
