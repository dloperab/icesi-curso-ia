'use client';

import { useHabits } from '@/hooks/useHabits';
import { useHabitStats } from '@/hooks/useHabitStats';
import { HabitCard } from '@/components/HabitCard';
import { HabitForm } from '@/components/HabitForm';
import { Button } from '@/components/ui/button';
import type { Habit } from '@/types/habits';

/**
 * HabitList component that displays a responsive grid of habits
 * Shows loading states with skeletons and error states with retry button
 * Includes empty state with call-to-action for creating first habit
 */
export function HabitList() {
  const { habits, isLoading, error, mutate } = useHabits();

  // Skeleton component for loading state
  const HabitSkeleton = () => (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 animate-pulse">
      <div className="h-6 w-3/4 rounded bg-muted" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-4/5 rounded bg-muted" />
      </div>
      <div className="h-10 w-full rounded bg-muted" />
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <HabitSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Error al cargar hábitos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ocurrió un error al obtener la lista de hábitos. Por favor, intenta de nuevo.
          </p>
        </div>
        <Button onClick={() => mutate()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  // Empty state
  if (!habits || habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-muted/20 p-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">No tienes hábitos aún</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comienza a seguir tus hábitos creando uno nuevo.
          </p>
        </div>
        <HabitForm>
          <Button>Crear tu primer hábito</Button>
        </HabitForm>
      </div>
    );
  }

  // Render habits grid
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <HabitListItem key={habit.id} habitId={habit.id} habit={habit} />
        ))}
      </div>
    </div>
  );
}

/**
 * HabitListItem - internal component to handle stats fetching for each habit
 * This separation allows stats to be fetched independently for each habit
 */
function HabitListItem({ habitId, habit }: { habitId: string; habit: Habit }) {
  const { stats, isLoading } = useHabitStats(habitId);

  // While loading, show the card without stats
  return <HabitCard habit={habit} stats={isLoading ? undefined : stats} />;
}
