/**
 * API Route handler for /api/habits/[id]
 * Handles deleting a specific habit
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * DELETE /api/habits/[id]
 * Deletes a habit by ID (cascade deletes associated logs)
 * 
 * @param request - Next.js request object
 * @param params - Route parameters containing habit ID
 * @returns Empty response (204) or error (404/500)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Attempt to delete habit (cascade delete configured in Prisma schema)
    await prisma.habit.delete({
      where: { id },
    });

    // Return 204 No Content on success
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Handle Prisma not found error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Habit not found' },
          { status: 404 }
        );
      }
    }

    // Handle other errors
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
