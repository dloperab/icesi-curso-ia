'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint } from '@/lib/chartUtils';

interface HabitChartProps {
  /** Data points for the chart */
  data: ChartDataPoint[];
  /** Type of chart to render */
  type: 'line' | 'bar';
  /** Optional title for the chart */
  title?: string;
  /** Optional height in pixels */
  height?: number;
}

/**
 * HabitChart component for visualizing habit completion data
 * Supports line and bar chart types with responsive design
 * Integrates with Recharts for data visualization
 */
export function HabitChart({
  data,
  type = 'line',
  title,
  height = 300,
}: HabitChartProps) {
  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 py-8"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  // Determine the color based on CSS variable from Tailwind
  const strokeColor = 'hsl(var(--primary))';

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={height} minWidth={300}>
          {type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => [value, 'Completados']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={strokeColor}
                strokeWidth={2}
                name="Completados"
                dot={{ fill: strokeColor, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                formatter={(value) => [value, 'Completados']}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill={strokeColor}
                name="Completados"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
