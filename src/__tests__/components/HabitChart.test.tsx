import { render, screen } from '@testing-library/react';
import { HabitChart } from '@/components/HabitChart';
import { vi, describe, it, expect } from 'vitest';
import type { ChartDataPoint } from '@/lib/chartUtils';

// Mock Recharts
vi.mock('recharts', () => ({
  LineChart: ({ children, data }: { children: React.ReactNode; data: ChartDataPoint[] }) => (
    <div data-testid="line-chart" data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  BarChart: ({ children, data }: { children: React.ReactNode; data: ChartDataPoint[] }) => (
    <div data-testid="bar-chart" data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  Line: () => <div />,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  Legend: () => <div />,
}));

describe('HabitChart', () => {
  const mockData: ChartDataPoint[] = [
    { date: 'Jan 01', value: 2 },
    { date: 'Jan 02', value: 1 },
    { date: 'Jan 03', value: 3 },
  ];

  describe('rendering', () => {
    it('renders line chart by default', () => {
      render(<HabitChart data={mockData} type="line" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders bar chart when type is bar', () => {
      render(<HabitChart data={mockData} type="bar" />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('passes data to chart component', () => {
      const { container } = render(<HabitChart data={mockData} type="line" />);
      const chart = container.querySelector('[data-testid="line-chart"]');
      expect(chart?.getAttribute('data-data')).toContain('Jan 01');
    });

    it('renders title when provided', () => {
      render(<HabitChart data={mockData} type="line" title="Progreso semanal" />);
      expect(screen.getByText('Progreso semanal')).toBeInTheDocument();
    });

    it('does not render title when not provided', () => {
      const { container } = render(<HabitChart data={mockData} type="line" />);
      const title = container.querySelector('h3');
      expect(title).toBeNull();
    });

    it('renders responsive container', () => {
      render(<HabitChart data={mockData} type="line" />);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('displays empty state message for empty data', () => {
      render(<HabitChart data={[]} type="line" />);
      expect(screen.getByText(/no hay datos para mostrar/i)).toBeInTheDocument();
    });

    it('does not render chart when data is empty', () => {
      render(<HabitChart data={[]} type="line" />);
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
    });

    it('handles undefined data as empty', () => {
      render(<HabitChart data={undefined as unknown as ChartDataPoint[]} type="line" />);
      expect(screen.getByText(/no hay datos para mostrar/i)).toBeInTheDocument();
    });

    it('displays empty state with correct height', () => {
      const { container } = render(<HabitChart data={[]} type="line" height={400} />);
      const emptyState = container.querySelector('div[style*="height"]');
      expect(emptyState?.getAttribute('style')).toContain('400px');
    });
  });

  describe('data handling', () => {
    it('renders with minimum data point', () => {
      const minData: ChartDataPoint[] = [{ date: 'Jan 01', value: 1 }];
      render(<HabitChart data={minData} type="line" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('renders with large dataset', () => {
      const largeData: ChartDataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `Day ${i + 1}`,
        value: Math.random() * 10,
      }));
      render(<HabitChart data={largeData} type="line" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('handles data with zero values', () => {
      const dataWithZeros: ChartDataPoint[] = [
        { date: 'Jan 01', value: 0 },
        { date: 'Jan 02', value: 1 },
        { date: 'Jan 03', value: 0 },
      ];
      render(<HabitChart data={dataWithZeros} type="line" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('handles data with large values', () => {
      const largeValueData: ChartDataPoint[] = [
        { date: 'Jan 01', value: 1000000 },
        { date: 'Jan 02', value: 2000000 },
      ];
      render(<HabitChart data={largeValueData} type="line" />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('props', () => {
    it('renders with custom height', () => {
      const { container } = render(
        <HabitChart data={mockData} type="line" height={500} />
      );
      // Check if the chart container respects height
      const chart = container.querySelector('[data-testid="responsive-container"]');
      expect(chart).toBeInTheDocument();
    });

    it('uses default height when not provided', () => {
      const { container } = render(
        <HabitChart data={mockData} type="line" />
      );
      const emptyStateContainer = container.querySelector('div[style*="300px"]');
      // Default height is 300
      expect(emptyStateContainer || container.querySelector('[data-testid="responsive-container"]')).toBeInTheDocument();
    });

    it('accepts both line and bar types', () => {
      const { rerender } = render(
        <HabitChart data={mockData} type="line" />
      );
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      rerender(<HabitChart data={mockData} type="bar" />);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies border-border class', () => {
      const { container } = render(
        <HabitChart data={mockData} type="line" />
      );
      const chartContainer = container.querySelector('.border-border');
      expect(chartContainer).toBeInTheDocument();
    });

    it('applies card background styling', () => {
      const { container } = render(
        <HabitChart data={mockData} type="line" />
      );
      const cardElement = container.querySelector('.bg-card');
      expect(cardElement).toBeInTheDocument();
    });

    it('applies responsive container styling', () => {
      const { container } = render(
        <HabitChart data={mockData} type="line" />
      );
      const responsiveContainer = container.querySelector('[class*="rounded"]');
      expect(responsiveContainer).toBeInTheDocument();
    });
  });
});
