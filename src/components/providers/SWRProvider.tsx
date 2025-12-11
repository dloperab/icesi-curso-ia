/**
 * SWR Provider component for global configuration
 * Configures caching, revalidation, and error handling policies
 */

'use client';

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: ReactNode;
}

/**
 * Custom fetcher for SWR that handles errors
 * @param resource - URL to fetch
 * @returns Parsed JSON response
 * @throws Error if response status is 400 or higher
 */
const fetcher = async (resource: string) => {
  const response = await fetch(resource);

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`) as Error & {
      status: number;
    };
    error.status = response.status;
    throw error;
  }

  return response.json();
};

/**
 * SWR Provider component that wraps the entire app
 * Provides global configuration for data fetching with SWR
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
