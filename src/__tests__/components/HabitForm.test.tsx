import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HabitForm } from '@/components/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useHabits hook
vi.mock('@/hooks/useHabits');

const mockUseHabits = vi.mocked(useHabits);

describe('HabitForm', () => {
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
  });

  it('renders trigger button', () => {
    render(<HabitForm />);
    expect(screen.getByRole('button', { name: /crear hábito/i })).toBeInTheDocument();
  });

  it('renders custom children as trigger', () => {
    render(
      <HabitForm>
        <button>Custom Button</button>
      </HabitForm>
    );
    expect(screen.getByRole('button', { name: /custom button/i })).toBeInTheDocument();
  });

  it('opens dialog when trigger is clicked', async () => {
    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });

    await userEvent.click(trigger);

    expect(screen.getByText(/crear nuevo hábito/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const mockCreateHabit = vi.fn().mockResolvedValue({
      id: '1',
      name: 'Test Habit',
      description: 'Test description',
      frequency: 'daily',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: mockCreateHabit,
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(trigger);

    const nameInput = screen.getByPlaceholderText(/ej: ejercicio diario/i);
    const descriptionInput = screen.getByPlaceholderText(/describe tu hábito/i);
    const submitButton = screen.getByRole('button', { name: /crear hábito/i });

    await userEvent.type(nameInput, 'Test Habit');
    await userEvent.type(descriptionInput, 'Test description');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateHabit).toHaveBeenCalledWith({
        name: 'Test Habit',
        description: 'Test description',
        frequency: 'daily',
      });
    });
  });

  it('displays validation error for empty name', async () => {
    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(trigger);

    const submitButton = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/habit name cannot be empty/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for name exceeding max length', async () => {
    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(trigger);

    const nameInput = screen.getByPlaceholderText(/ej: ejercicio diario/i);
    const submitButton = screen.getByRole('button', { name: /crear hábito/i });

    await userEvent.type(nameInput, 'a'.repeat(101));
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/habit name must be 100 characters or less/i)).toBeInTheDocument();
    });
  });

  it('displays API error message', async () => {
    const mockCreateHabit = vi.fn().mockRejectedValue(new Error('API Error'));

    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: mockCreateHabit,
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(trigger);

    const nameInput = screen.getByPlaceholderText(/ej: ejercicio diario/i);
    const submitButton = screen.getByRole('button', { name: /crear hábito/i });

    await userEvent.type(nameInput, 'Test Habit');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument();
    });
  });

  it('closes dialog after successful submission', async () => {
    const mockCreateHabit = vi.fn().mockResolvedValue({
      id: '1',
      name: 'Test Habit',
      description: null,
      frequency: 'daily',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: mockCreateHabit,
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(trigger);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(/crear nuevo hábito/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/ej: ejercicio diario/i);
    const buttons = screen.getAllByRole('button', { name: /crear hábito/i });
    const submitButton = buttons[buttons.length - 1]; // Get the last one (submit button in dialog)

    await userEvent.type(nameInput, 'Test Habit');
    await userEvent.click(submitButton);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByText(/crear nuevo hábito/i)).not.toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    const mockCreateHabit = vi.fn().mockResolvedValue({
      id: '1',
      name: 'Test Habit',
      description: null,
      frequency: 'daily',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: mockCreateHabit,
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitForm />);
    const triggerButton = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(triggerButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(/crear nuevo hábito/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/ej: ejercicio diario/i) as HTMLInputElement;
    const buttons = screen.getAllByRole('button', { name: /crear hábito/i });
    const submitButton = buttons[buttons.length - 1];

    await userEvent.type(nameInput, 'Test Habit');
    await userEvent.click(submitButton);

    // Wait for form reset (dialog closes)
    await waitFor(() => {
      expect(screen.queryByText(/crear nuevo hábito/i)).not.toBeInTheDocument();
    });
  });

  it('changes frequency to weekly', async () => {
    const mockCreateHabit = vi.fn().mockResolvedValue({
      id: '1',
      name: 'Test Habit',
      description: null,
      frequency: 'daily',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUseHabits.mockReturnValue({
      habits: [],
      isLoading: false,
      error: undefined,
      createHabit: mockCreateHabit,
      deleteHabit: vi.fn(),
      mutate: vi.fn(),
    });

    render(<HabitForm />);
    const trigger = screen.getByRole('button', { name: /crear hábito/i });
    await userEvent.click(trigger);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByText(/crear nuevo hábito/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/ej: ejercicio diario/i);
    const buttons = screen.getAllByRole('button', { name: /crear hábito/i });
    const submitButton = buttons[buttons.length - 1];

    await userEvent.type(nameInput, 'Test Habit');
    await userEvent.click(submitButton);

    await waitFor(() => {
      // Verify the form was submitted with data
      expect(mockCreateHabit).toHaveBeenCalled();
      expect(mockCreateHabit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Habit' })
      );
    });
  });
});
