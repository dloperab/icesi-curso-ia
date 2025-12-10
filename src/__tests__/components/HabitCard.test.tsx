import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitCard } from '@/components/HabitCard';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Habit, HabitStats } from '@/types/habits';

// Mock hooks
vi.mock('@/hooks/useHabits');
vi.mock('@/hooks/useHabitLogs');
vi.mock('next/navigation');

const mockUseHabits = vi.mocked(useHabits);
const mockUseHabitLogs = vi.mocked(useHabitLogs);
const mockUseRouter = vi.mocked(useRouter);

const mockHabit: Habit = {
  id: 'habit-1',
  name: 'Test Habit',
  description: 'Test description',
  frequency: 'daily',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStats: HabitStats = {
  habitId: 'habit-1',
  currentStreak: 5,
  maxStreak: 10,
  completionRate: 50,
  nextExpectedDate: new Date(),
  totalLogs: 10,
};

describe('HabitCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });
    mockUseHabitLogs.mockReturnValue({
      createLog: vi.fn(),
      isCreating: false,
    });
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
    } as never);
  });

  it('renders habit name and frequency', () => {
    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    expect(screen.getByText('Test Habit')).toBeInTheDocument();
    expect(screen.getAllByText('Diario').length).toBeGreaterThanOrEqual(1);
  });

  it('renders truncated description', () => {
    const longDescription = 'a'.repeat(150);
    const habitWithLongDesc = { ...mockHabit, description: longDescription };
    render(<HabitCard habit={habitWithLongDesc} stats={mockStats} />);

    const description = screen.getByText(/^a+\.{3}$/);
    expect(description).toBeInTheDocument();
  });

  it('renders frequency badge', () => {
    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const badges = screen.getAllByText('Diario');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('renders current streak when stats provided', () => {
    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    expect(screen.getByText('Racha Actual')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays 🔥 icon for active streak', () => {
    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('displays ⚫ icon for no streak', () => {
    const statsWithoutStreak = { ...mockStats, currentStreak: 0 };
    render(<HabitCard habit={mockHabit} stats={statsWithoutStreak} />);
    expect(screen.getByText('⚫')).toBeInTheDocument();
  });

  it('calls createLog when check-in button is clicked', async () => {
    const mockCreateLog = vi.fn().mockResolvedValue({});
    mockUseHabitLogs.mockReturnValue({
      createLog: mockCreateLog,
      isCreating: false,
    });

    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const checkInButton = screen.getByRole('button', { name: /completado hoy/i });

    await userEvent.click(checkInButton);

    expect(mockCreateLog).toHaveBeenCalledWith('habit-1');
  });

  it('displays error message on check-in failure', async () => {
    const mockCreateLog = vi.fn().mockRejectedValue(new Error('409: Duplicate entry'));
    mockUseHabitLogs.mockReturnValue({
      createLog: mockCreateLog,
      isCreating: false,
    });

    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const checkInButton = screen.getByRole('button', { name: /completado hoy/i });

    await userEvent.click(checkInButton);

    await waitFor(() => {
      expect(screen.getByText(/ya has completado este hábito hoy/i)).toBeInTheDocument();
    });
  });

  it('navigates to habit details when "Ver detalles" is clicked', async () => {
    const mockPush = vi.fn();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as never);

    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const detailsButton = screen.getByRole('button', { name: /ver detalles/i });

    await userEvent.click(detailsButton);

    expect(mockPush).toHaveBeenCalledWith('/habits/habit-1');
  });

  it('opens delete confirmation dialog', async () => {
    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const deleteButton = screen.getByRole('button', { name: /^Eliminar$/i });

    await userEvent.click(deleteButton);

    expect(screen.getByText(/¿estás seguro/i)).toBeInTheDocument();
  });

  it('calls deleteHabit when confirmed', async () => {
    const mockDeleteHabit = vi.fn().mockResolvedValue(undefined);
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: mockDeleteHabit,
      mutate: vi.fn(),
    });

    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const deleteButton = screen.getByRole('button', { name: /^Eliminar$/i });

    await userEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /^Eliminar$/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteHabit).toHaveBeenCalledWith('habit-1');
    });
  });

  it('renders weekly frequency correctly', () => {
    const weeklyHabit = { ...mockHabit, frequency: 'weekly' as const };
    render(<HabitCard habit={weeklyHabit} stats={mockStats} />);

    expect(screen.getAllByText('Semanal').length).toBeGreaterThanOrEqual(1);
  });

  it('disables buttons during check-in', () => {
    mockUseHabitLogs.mockReturnValue({
      createLog: vi.fn(),
      isCreating: true,
    });

    render(<HabitCard habit={mockHabit} stats={mockStats} />);
    const checkInButton = screen.getByRole('button', { name: /registrando/i });

    expect(checkInButton).toBeDisabled();
  });

  it('hides description when not provided', () => {
    const habitWithoutDesc = { ...mockHabit, description: null };
    render(<HabitCard habit={habitWithoutDesc} stats={mockStats} />);

    // Description should not be rendered
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});
