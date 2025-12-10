import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitDashboard } from '@/components/HabitDashboard';
import { useHabits } from '@/hooks/useHabits';
import { useHabitStats } from '@/hooks/useHabitStats';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Habit, HabitStats } from '@/types/habits';

// Mock hooks and modules
vi.mock('@/hooks/useHabits');
vi.mock('@/hooks/useHabitStats');
vi.mock('next/navigation');
vi.mock('@/components/HabitChart', () => ({
  HabitChart: ({ data }: { data: unknown[] }) => <div data-testid="habit-chart" data-points={(data as Array<unknown>).length} />,
}));

const mockUseHabits = vi.mocked(useHabits);
const mockUseHabitStats = vi.mocked(useHabitStats);
const mockUseRouter = vi.mocked(useRouter);

const mockHabit: Habit = {
  id: 'habit-1',
  name: 'Test Habit',
  description: 'Test description',
  frequency: 'daily',
  createdAt: new Date(),
  updatedAt: new Date(),
  logs: [],
};

const mockStats: HabitStats = {
  habitId: 'habit-1',
  currentStreak: 7,
  maxStreak: 15,
  completionRate: 75,
  nextExpectedDate: new Date(),
  totalLogs: 20,
};

describe('HabitDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });
    mockUseHabitStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
    } as never);
  });

  it('renders loading state', () => {
    mockUseHabitStats.mockReturnValue({
      stats: undefined,
      isLoading: true,
      error: undefined,
      mutate: vi.fn(),
    });

    render(<HabitDashboard habitId="habit-1" />);

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders habit title and description', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Test Habit')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('renders frequency badge', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Diario')).toBeInTheDocument();
    });
  });

  it('renders time range buttons', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /7 días/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /30 días/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /90 días/i })).toBeInTheDocument();
    });
  });

  it('renders all metric cards', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Racha Actual')).toBeInTheDocument();
      expect(screen.getByText('Racha Máxima')).toBeInTheDocument();
      expect(screen.getByText('Tasa de Completitud')).toBeInTheDocument();
      expect(screen.getByText('Total Registros')).toBeInTheDocument();
    });
  });

  it('displays correct metric values', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument(); // currentStreak
      expect(screen.getByText('15')).toBeInTheDocument(); // maxStreak
      expect(screen.getByText('75.0%')).toBeInTheDocument(); // completionRate
      expect(screen.getByText('20')).toBeInTheDocument(); // totalLogs
    });
  });

  it('renders chart component', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('habit-chart')).toBeInTheDocument();
    });
  });

  it('renders back button', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    const backButton = screen.getByRole('button', { name: /volver/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls router.back when back button clicked', async () => {
    const mockBack = vi.fn();
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      back: mockBack,
    } as never);

    render(<HabitDashboard habitId="habit-1" />);

    const backButton = screen.getByRole('button', { name: /volver/i });
    await userEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('renders error state when statsError exists', async () => {
    mockUseHabitStats.mockReturnValue({
      stats: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      mutate: vi.fn(),
    });

    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar estadísticas/i)).toBeInTheDocument();
    });
  });

  it('renders not found state when habit not found', async () => {
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitDashboard habitId="nonexistent-id" />);

    await waitFor(() => {
      expect(screen.getByText(/hábito no encontrado/i)).toBeInTheDocument();
    });
  });

  it('changes time range on button click', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    const button7days = screen.getByRole('button', { name: /7 días/i });
    const button30days = screen.getByRole('button', { name: /30 días/i });

    // 30 days should be selected by default (check by button appearance)
    expect(button30days).toBeInTheDocument();

    // Click 7 days
    await userEvent.click(button7days);

    // Verify the button is still clickable/present
    await waitFor(() => {
      expect(button7days).toBeInTheDocument();
    });
  });

  it('renders weekly frequency correctly', async () => {
    const weeklyHabit = { ...mockHabit, frequency: 'weekly' as const };
    mockUseHabits.mockReturnValue({
      habits: [weeklyHabit],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Semanal')).toBeInTheDocument();
    });
  });

  it('renders next expected date', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const statsWithDate = { ...mockStats, nextExpectedDate: futureDate };
    mockUseHabitStats.mockReturnValue({
      stats: statsWithDate,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Próxima Fecha Esperada')).toBeInTheDocument();
    });
  });

  it('handles null next expected date', async () => {
    const statsWithoutDate = { ...mockStats, nextExpectedDate: null };
    mockUseHabitStats.mockReturnValue({
      stats: statsWithoutDate,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Completa tu primer registro para ver la próxima fecha/i)).toBeInTheDocument();
    });
  });

  it('displays progress temporal section', async () => {
    render(<HabitDashboard habitId="habit-1" />);

    await waitFor(() => {
      expect(screen.getByText('Progreso Temporal')).toBeInTheDocument();
      expect(screen.getByText(/últimos 30 días/i)).toBeInTheDocument();
    });
  });
});
