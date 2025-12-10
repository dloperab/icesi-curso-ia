'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Habit, HabitStats } from '@/types/habits';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HabitCardProps {
  habit: Habit;
  stats?: HabitStats;
  onStatsChange?: () => Promise<void>;
}

/**
 * HabitCard component for displaying a single habit
 * Shows habit name, description, frequency, current streak, and check-in button
 * Includes options for viewing details and deleting the habit
 */
export function HabitCard({ habit, stats, onStatsChange }: HabitCardProps) {
  const router = useRouter();
  const { deleteHabit } = useHabits();
  const { createLog, isCreating } = useHabitLogs();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  const frequencyLabel = habit.frequency === 'daily' ? 'Diario' : 'Semanal';
  const hasActiveStreak = stats && stats.currentStreak > 0;
  const streakIndicator = hasActiveStreak ? '🔥' : '⚫';

  const handleCheckIn = async () => {
    setCheckInError(null);
    try {
      await createLog(habit.id, undefined, onStatsChange);
      // Clear any existing error on success
      setCheckInError(null);
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a duplicate error (409)
        if (error.message.includes('409') || error.message.includes('duplicate') || error.message.includes('already exists')) {
          setCheckInError('Ya has completado este hábito hoy');
          // Keep error visible for 5 seconds
          setTimeout(() => setCheckInError(null), 5000);
        } else {
          setCheckInError(error.message);
          setTimeout(() => setCheckInError(null), 5000);
        }
      } else {
        setCheckInError('Error al registrar el check-in');
        setTimeout(() => setCheckInError(null), 5000);
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteHabit(habit.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting habit:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = () => {
    router.push(`/habits/${habit.id}`);
  };

  // Truncate description to 100 characters
  const truncatedDescription = habit.description
    ? habit.description.length > 100
      ? `${habit.description.substring(0, 100)}...`
      : habit.description
    : null;

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl">{habit.name}</CardTitle>
              <CardDescription>{frequencyLabel}</CardDescription>
            </div>
            <Badge variant="secondary">{frequencyLabel}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {/* Description */}
          {truncatedDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">{truncatedDescription}</p>
          )}

          {/* Streak Display */}
          {stats && (
            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
              <span className="text-2xl">{streakIndicator}</span>
              <div>
                <p className="text-sm font-semibold">Racha Actual</p>
                <p className="text-lg font-bold text-primary">{stats.currentStreak}</p>
              </div>
            </div>
          )}

          {/* Check-in Error */}
          {checkInError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {checkInError}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleCheckIn}
              disabled={isCreating}
              variant="default"
              className="w-full"
            >
              {isCreating ? 'Registrando...' : '✓ Completado hoy'}
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleViewDetails}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Ver detalles
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar hábito</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar <strong>{habit.name}</strong>? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
