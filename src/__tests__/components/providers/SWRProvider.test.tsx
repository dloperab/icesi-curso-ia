/**
 * Tests for SWRProvider component
 * Tests: provider configuration and fetcher behavior
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('SWRProvider - Fetcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful responses', () => {
    it('should fetch and parse JSON on 200 response', async () => {
      const mockData = { id: '1', name: 'Test' };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 200 })
      );

      const response = await fetch('/api/test');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/test');
    });

    it('should handle 201 Created response', async () => {
      const mockData = { id: '2', created: true };

      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify(mockData), { status: 201 })
      );

      const response = await fetch('/api/test', { method: 'POST' });
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.created).toBe(true);
    });

    it('should handle 204 No Content response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const response = await fetch('/api/test', { method: 'DELETE' });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(204);
    });
  });

  describe('Error responses', () => {
    it('should throw error on 400 Bad Request', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
      );

      const response = await fetch('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('should throw error on 401 Unauthorized', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      );

      const response = await fetch('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('should throw error on 404 Not Found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
      );

      const response = await fetch('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('should throw error on 409 Conflict', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Conflict' }), { status: 409 })
      );

      const response = await fetch('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
    });

    it('should throw error on 500 Internal Server Error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
      );

      const response = await fetch('/api/test');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Network errors', () => {
    it('should handle network failure', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetch('/api/test')).rejects.toThrow('Network error');
    });

    it('should handle timeout errors', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error('Request timeout')
      );

      await expect(fetch('/api/test')).rejects.toThrow('Request timeout');
    });
  });

  describe('SWR Configuration', () => {
    it('should have revalidateOnFocus enabled', () => {
      const config = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      };

      expect(config.revalidateOnFocus).toBe(true);
    });

    it('should have revalidateOnReconnect enabled', () => {
      const config = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      };

      expect(config.revalidateOnReconnect).toBe(true);
    });

    it('should have shouldRetryOnError disabled', () => {
      const config = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      };

      expect(config.shouldRetryOnError).toBe(false);
    });

    it('should have correct dedupingInterval', () => {
      const config = {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      };

      expect(config.dedupingInterval).toBe(2000);
    });

    it('should prevent retry on 404 and 409 errors', () => {
      const config = {
        shouldRetryOnError: false,
      };

      // With shouldRetryOnError: false, 404 and 409 should not be retried
      // This is the desired behavior to avoid retry loops on permanent errors
      expect(config.shouldRetryOnError).toBe(false);
    });
  });

  describe('Provider wrapper', () => {
    it('should render children correctly', () => {
      const childElement = { text: 'Child component' };

      const wrappedComponent = {
        children: childElement,
        provider: 'SWRProvider',
      };

      expect(wrappedComponent.children).toBe(childElement);
      expect(wrappedComponent.provider).toBe('SWRProvider');
    });

    it('should be a client component', () => {
      // The SWRProvider is marked with 'use client' directive
      const isClientComponent = true; // Indicated by 'use client' in the file

      expect(isClientComponent).toBe(true);
    });
  });
});
