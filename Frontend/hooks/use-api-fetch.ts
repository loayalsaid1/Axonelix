import { useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { apiFetch, type FetchOptions } from '@/lib/api/client';

/**
 * Returns a memoized fetch function that automatically attaches the Clerk
 * Bearer token to every request. Use this in any client component / hook
 * that calls the NestJS backend directly.
 *
 * @example
 * const authFetch = useApiFetch();
 * const data = await authFetch<Module[]>('/materials/modules');
 */
export function useApiFetch() {
  const { getToken } = useAuth();

  return useCallback(
    async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
      const token = await getToken();
      return apiFetch<T>(path, {
        ...options,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
      });
    },
    [getToken],
  );
}
