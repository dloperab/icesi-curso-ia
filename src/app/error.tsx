'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Global error.tsx - Error boundary that catches errors from the entire app
 * Displays user-friendly error message with recovery options
 * Logs errors to console (development) or external service (production)
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development, or send to external service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Application error:', error);
      if (error.digest) {
        console.error('Error digest:', error.digest);
      }
    } else {
      // In production, you could send to an error tracking service like Sentry
      // Example: captureException(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Error icon and heading */}
        <div className="space-y-3 text-center">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground">
            Algo salió mal
          </h1>
        </div>

        {/* Error message */}
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-muted-foreground">
            {error.message ||
              'Ocurrió un error inesperado. Por favor, intenta recargar la página.'}
          </p>
          {process.env.NODE_ENV === 'development' && error.digest && (
            <p className="mt-2 text-xs font-mono text-muted-foreground">
              ID del error: {error.digest}
            </p>
          )}
        </div>

        {/* Recovery actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={() => reset()} size="lg" className="w-full">
            Intentar de nuevo
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Ir al inicio
          </Button>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-muted-foreground">
          Si el problema persiste, intenta recargar completamente la página o borra el caché del navegador.
        </p>
      </div>
    </div>
  );
}
