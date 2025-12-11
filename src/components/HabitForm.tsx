'use client';

import { useState, useRef } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { createHabitSchema } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ZodError } from 'zod';

interface HabitFormProps {
  children?: React.ReactNode;
}

/**
 * HabitForm component for creating new habits
 * Renders as a Dialog with form inputs for habit name, description, and frequency
 * Integrates with useHabits hook for creation with optimistic updates
 */
export function HabitForm({ children }: HabitFormProps) {
  const { createHabit } = useHabits();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const frequencyRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    if (nameRef.current) nameRef.current.value = '';
    if (descriptionRef.current) descriptionRef.current.value = '';
    if (frequencyRef.current) frequencyRef.current.value = 'daily';
    setValidationErrors({});
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setValidationErrors({});

    try {
      const descValue = descriptionRef.current?.value;
      const formData = {
        name: nameRef.current?.value || '',
        description: descValue ? descValue : undefined,
        frequency: (frequencyRef.current?.value as 'daily' | 'weekly') || 'daily',
      };

      // Validate with Zod
      const validatedData = createHabitSchema.parse(formData);

      // Create habit
      await createHabit(validatedData);

      // Reset form and close dialog
      resetForm();
      setIsOpen(false);
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to field names
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || <Button>Crear Hábito</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Hábito</DialogTitle>
          <DialogDescription>
            Agrega un nuevo hábito para comenzar a seguir tu progreso
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Hábito <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              ref={nameRef}
              placeholder="Ej: Ejercicio diario"
              disabled={isLoading}
              aria-invalid={!!validationErrors.name}
              aria-describedby={validationErrors.name ? 'name-error' : undefined}
            />
            {validationErrors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              ref={descriptionRef}
              placeholder="Describe tu hábito..."
              disabled={isLoading}
              aria-invalid={!!validationErrors.description}
              aria-describedby={validationErrors.description ? 'description-error' : undefined}
            />
            {validationErrors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {validationErrors.description}
              </p>
            )}
          </div>

          {/* Frecuencia */}
          <div className="space-y-2">
            <Label>
              Frecuencia <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  ref={frequencyRef}
                  defaultChecked
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <span className="text-sm">Diario</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <span className="text-sm">Semanal</span>
              </label>
            </div>
            {validationErrors.frequency && (
              <p className="text-sm text-destructive">{validationErrors.frequency}</p>
            )}
          </div>

          {/* API Error */}
          {apiError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {apiError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Hábito'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
