'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useHabits } from '@/hooks/useHabits';
import { useHabitStats } from '@/hooks/useHabitStats';
import { HabitChart } from '@/components/HabitChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { transformLogsToChartData, filterLogsByDateRange } from '@/lib/chartUtils';
import type { HabitLog } from '@/types/habits';

interface HabitDashboardProps {
  habitId: string;
}

const RANGE_OPTIONS = {
  '7': { label: '7 días', days: 7 },
  '30': { label: '30 días', days: 30 },
  '90': { label: '90 días', days: 90 },
};

/**
 * HabitDashboard component for detailed habit analytics
 * Displays statistics, charts, and time range selection
 * Fetches logs and calculates metrics on-demand
 */
export function HabitDashboard({ habitId }: HabitDashboardProps) {
  const router = useRouter();
  const { habits } = useHabits();
  const [selectedRange, setSelectedRange] = useState<keyof typeof RANGE_OPTIONS>('30');

  // Find the habit being viewed
  const habit = useMemo(() => habits?.find((h) => h.id === habitId), [habits, habitId]);

  // Fetch stats for selected range
  const fromDate = useMemo(() => {
    const days = RANGE_OPTIONS[selectedRange].days;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }, [selectedRange]);

  const { stats, isLoading: isStatsLoading, error: statsError } = useHabitStats(habitId, fromDate);

  // Get filtered logs for chart from stats
  const chartData = useMemo(() => {
    if (!stats?.logs || stats.logs.length === 0) return [];
    return transformLogsToChartData(stats.logs as HabitLog[], 'day');
  }, [stats]);

  // Loading state
  if (isStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded bg-muted" />
            ))}
          </div>
          <div className="h-80 rounded bg-muted" />
        </div>
      </div>
    );
  }

  // Error state
  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Error al cargar estadísticas</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No pudimos obtener los datos del hábito. Por favor, intenta de nuevo.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Volver
        </Button>
      </div>
    );
  }

  // Not found
  if (!habit) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/20 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Hábito no encontrado</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            El hábito que buscas no existe o fue eliminado.
          </p>
        </div>
        <Button onClick={() => router.push('/')} variant="outline">
          Volver al inicio
        </Button>
      </div>
    );
  }

  const frequencyLabel = habit.frequency === 'daily' ? 'Diario' : 'Semanal';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{habit.name}</h1>
            <p className="text-muted-foreground">{habit.description}</p>
          </div>
          <Badge variant="secondary">{frequencyLabel}</Badge>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {Object.entries(RANGE_OPTIONS).map(([key, option]) => (
          <Button
            key={key}
            onClick={() => setSelectedRange(key as keyof typeof RANGE_OPTIONS)}
            variant={selectedRange === key ? 'default' : 'outline'}
            size="sm"
          >
            {option.label}
          </Button>
        ))}
        <Button onClick={() => router.back()} variant="outline" size="sm" className="ml-auto">
          Volver
        </Button>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <MetricCard
            title="Racha Actual"
            value={stats.currentStreak.toString()}
            subtext="días seguidos"
            icon="🔥"
          />
          <MetricCard
            title="Racha Máxima"
            value={stats.maxStreak.toString()}
            subtext="mejor racha"
            icon="⭐"
          />
          <MetricCard
            title="Tasa de Completitud"
            value={`${stats.completionRate.toFixed(1)}%`}
            subtext="de las veces"
            icon="📊"
          />
          <MetricCard
            title="Total Registros"
            value={stats.totalLogs.toString()}
            subtext="veces completado"
            icon="✓"
          />
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso Temporal</CardTitle>
          <CardDescription>
            Completaciones en los últimos {RANGE_OPTIONS[selectedRange].days} días
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HabitChart data={chartData} type="bar" height={300} />
        </CardContent>
      </Card>

      {/* Additional Info */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Próxima Fecha Esperada</CardTitle>
            <CardDescription>
              {habit.frequency === 'daily' ? 'Siguiente día para completar' : 'Siguiente semana para completar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.nextExpectedDate ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold text-primary">
                  {new Date(stats.nextExpectedDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const nextDate = new Date(stats.nextExpectedDate);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    nextDate.setHours(0, 0, 0, 0);
                    const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysUntil === 0) return 'Pendiente - ¡Completa hoy!';
                    if (daysUntil === 1) return 'Mañana - ¡Ya completaste hoy!';
                    if (daysUntil > 1 && daysUntil <= 7) return `En ${daysUntil} días`;
                    return `En ${daysUntil} días - ¡Ya completaste ${habit.frequency === 'daily' ? 'hoy' : 'esta semana'}!`;
                  })()}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Completa tu primer registro para ver la próxima fecha</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: string;
}

/**
 * MetricCard - Internal component for displaying individual metrics
 */
function MetricCard({ title, value, subtext, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-2xl">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{subtext}</p>
        </div>
      </CardContent>
    </Card>
  );
}
