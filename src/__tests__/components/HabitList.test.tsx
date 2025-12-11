import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitList } from '@/components/HabitList';
import { useHabits } from '@/hooks/useHabits';
import { useHabitStats } from '@/hooks/useHabitStats';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Habit, HabitStats } from '@/types/habits';

// Mock hooks
vi.mock('@/hooks/useHabits');
vi.mock('@/hooks/useHabitStats');

const mockUseHabits = vi.mocked(useHabits);
const mockUseHabitStats = vi.mocked(useHabitStats);

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

describe('HabitList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  mutate: vi.fn(),
    });

  it('renders loading skeletons', () => {
    mockUseHabits.mockReturnValue({
      habits: undefined,
      isLoading: true,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    // Check for multiple skeleton elements (6 skeletons)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  mutate: vi.fn(),
    });

  it('renders error state with retry button', () => {
    const mockMutate = vi.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: new Error('Failed to fetch'),
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: mockMutate,
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    expect(screen.getByText(/error al cargar hábitos/i)).toBeInTheDocument();
    expect(screen.getByText(/intenta de nuevo/i)).toBeInTheDocument();
  mutate: vi.fn(),
    });

  it('displays retry button in error state', async () => {
    const mockMutate = vi.fn();
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: new Error('Failed to fetch'),
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: mockMutate,
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    const retryButton = screen.getByRole('button', { name: /reintentar/i mutate: vi.fn(),
    });
    await userEvent.click(retryButton);

    expect(mockMutate).toHaveBeenCalled();
  mutate: vi.fn(),
    });

  it('renders empty state when no habits', () => {
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    expect(screen.getByText(/no tienes hábitos aún/i)).toBeInTheDocument();
    expect(screen.getByText(/comienza a seguir/i)).toBeInTheDocument();
  mutate: vi.fn(),
    });

  it('displays create button in empty state', () => {
    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    expect(screen.getByRole('button', { name: /crear tu primer hábito/i })).toBeInTheDocument();
  mutate: vi.fn(),
    });

  it('renders habit list with multiple habits', async () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit, mockHabit2],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    mockUseHabitStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: undefined,
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
      expect(screen.getByText('Test Habit 2')).toBeInTheDocument();
    mutate: vi.fn(),
    });
  mutate: vi.fn(),
    });

  it('renders grid with responsive columns', () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit, mockHabit2],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    mockUseHabitStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    const { container } = render(<HabitList />);
    
    const grid = container.querySelector('[class*="grid"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toMatch(/md:grid-cols-2/);
    expect(grid?.className).toMatch(/lg:grid-cols-3/);
  mutate: vi.fn(),
    });

  it('renders HabitCard for each habit', async () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit, mockHabit2],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    mockUseHabitStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: undefined,
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
      expect(screen.getByText('Test Habit 2')).toBeInTheDocument();
    mutate: vi.fn(),
    });
  mutate: vi.fn(),
    });

  it('shows stats when loaded', async () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    mockUseHabitStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    await waitFor(() => {
      expect(screen.getByText('Racha Actual')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    mutate: vi.fn(),
    });
  mutate: vi.fn(),
    });

  it('handles stats loading state', () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    mockUseHabitStats.mockReturnValue({
      stats: undefined,
      isLoading: true,
      error: undefined,
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
    // Stats should not be visible while loading
    expect(screen.queryByText('Racha Actual')).not.toBeInTheDocument();
  mutate: vi.fn(),
    });

  it('renders single habit when only one exists', () => {
    mockUseHabits.mockReturnValue({
      habits: [mockHabit],
      isLoading: false,
      error: undefined,
      createHabit: vi.fn(),
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    mockUseHabitStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    mutate: vi.fn(),
    });

    render(<HabitList />);
    
    expect(screen.getByText('Test Habit 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Habit 2')).not.toBeInTheDocument();
  mutate: vi.fn(),
    });
mutate: vi.fn(),
    });
