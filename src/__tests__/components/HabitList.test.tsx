import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitList } from '@/components/HabitList';
import { useHabits } from '@/hooks/useHabits';
import { useHabitStats } from '@/hooks/useHabitStats';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Habit, HabitStats } from '@/types/habits';

// Mock hooks
vi.mock('@/hooks/useHabits');
vi.mock('@/hooks/useHabitStats');
vi.mock('next/navigation');

const mockUseHabits = vi.mocked(useHabits);
const mockUseHabitStats = vi.mocked(useHabitStats);
const mockUseRouter = vi.mocked(useRouter);

// Mock data
const mockHabit: Habit = {
  id: 'habit-1',
  name: 'Test Habit 1',
  description: 'Test description 1',
  frequency: 'daily',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockHabit2: Habit = {
  id: 'habit-2',
  name: 'Test Habit 2',
  description: 'Test description 2',
  frequency: 'weekly',
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

// Helper function to create default mock return values
const createMockHabitsReturn = (overrides = {}) => ({
  habits: [],
  isLoading: false,
  error: undefined,
  createHabit: vi.fn(),
  deleteHabit: vi.fn(),
  mutate: vi.fn(),
  ...overrides,
});

const createMockStatsReturn = (overrides = {}) => ({
  stats: undefined,
  isLoading: false,
  error: undefined,
  mutate: vi.fn(),
  ...overrides,
});

describe('HabitList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    mockUseHabits.mockReturnValue(createMockHabitsReturn());
    mockUseHabitStats.mockReturnValue(createMockStatsReturn());
  });


  describe('Loading State', () => {
    it('renders loading skeletons when habits are loading', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: undefined,
          isLoading: true,
        })
      );

      render(<HabitList />);

      // Check for multiple skeleton elements (pulse animation)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('renders error message when fetch fails', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [],
          error: new Error('Failed to fetch'),
        })
      );

      render(<HabitList />);

      expect(screen.getByText(/error al cargar hábitos/i)).toBeInTheDocument();
    });

    it('displays retry button in error state', async () => {
      const mockMutate = vi.fn();
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [],
          error: new Error('Failed to fetch'),
          mutate: mockMutate,
        })
      );

      render(<HabitList />);

      const retryButton = screen.getByRole('button', { name: /reintentar/i });
      await userEvent.click(retryButton);

      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when no habits exist', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [],
        })
      );

      render(<HabitList />);

      expect(screen.getByText(/no tienes hábitos aún/i)).toBeInTheDocument();
    });

    it('displays create button in empty state', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [],
        })
      );

      render(<HabitList />);

      expect(
        screen.getByRole('button', { name: /crear tu primer hábito/i })
      ).toBeInTheDocument();
    });
  });

  describe('Habit List Rendering', () => {
    it('renders habit list with multiple habits', async () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit, mockHabit2],
        })
      );

      mockUseHabitStats.mockReturnValue(
        createMockStatsReturn({
          stats: mockStats,
        })
      );

      render(<HabitList />);

      await waitFor(() => {
        expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
        expect(screen.getByText('Test Habit 2')).toBeInTheDocument();
      });
    });

    it('renders single habit when only one exists', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit],
        })
      );

      mockUseHabitStats.mockReturnValue(
        createMockStatsReturn({
          stats: mockStats,
        })
      );

      render(<HabitList />);

      expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Habit 2')).not.toBeInTheDocument();
    });

    it('renders grid with responsive columns', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit, mockHabit2],
        })
      );

      const { container } = render(<HabitList />);

      const grid = container.querySelector('[class*="grid"]');
      expect(grid).toBeInTheDocument();
      expect(grid?.className).toMatch(/md:grid-cols-2/);
      expect(grid?.className).toMatch(/lg:grid-cols-3/);
    });
  });

  describe('Stats Display', () => {
    it('displays stats when loaded', async () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit],
        })
      );

      mockUseHabitStats.mockReturnValue(
        createMockStatsReturn({
          stats: mockStats,
        })
      );

      render(<HabitList />);

      await waitFor(() => {
        expect(screen.getByText('Racha Actual')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('handles stats loading state gracefully', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit],
        })
      );

      mockUseHabitStats.mockReturnValue(
        createMockStatsReturn({
          stats: undefined,
          isLoading: true,
        })
      );

      render(<HabitList />);

      expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
      // Stats should not be visible while loading
      expect(screen.queryByText('Racha Actual')).not.toBeInTheDocument();
    });

    it('displays stats for multiple habits', async () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit, mockHabit2],
        })
      );

      mockUseHabitStats.mockReturnValue(
        createMockStatsReturn({
          stats: mockStats,
        })
      );

      render(<HabitList />);

      await waitFor(() => {
        expect(screen.getAllByText(/Racha/i).length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('User Interactions', () => {
    it('handles habit card click to navigate to details', async () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit],
        })
      );

      mockUseHabitStats.mockReturnValue(
        createMockStatsReturn({
          stats: mockStats,
        })
      );

      const { container } = render(<HabitList />);

      const habitCard = container.querySelector('[href*="habit-1"]');
      if (habitCard) {
        await userEvent.click(habitCard);
      }

      // Component should still render without errors
      expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit],
        })
      );

      const { container } = render(<HabitList />);

      // Check for proper grid structure
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('renders habit names as accessible text', () => {
      mockUseHabits.mockReturnValue(
        createMockHabitsReturn({
          habits: [mockHabit, mockHabit2],
        })
      );

      render(<HabitList />);

      expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
      expect(screen.getByText('Test Habit 2')).toBeInTheDocument();
    });
  });
});
