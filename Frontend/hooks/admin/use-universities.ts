import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';

export interface University {
  id: string;
  name: string;
  createdAt?: string;
}

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<University[]>('/questions/universities');
      setUniversities(data.map((u) => ({ ...u, id: String(u.id) })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch universities'));
      console.error('Failed to fetch universities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUniversity = useCallback(async (name: string) => {
    try {
      const data = await apiFetch<University>('/questions/universities', {
        method: 'POST',
        body: { name },
      });
      const university = { ...data, id: String(data.id) };
      setUniversities((prev) => [...prev, university]);
      return university;
    } catch (err) {
      console.error('Failed to create university:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  return {
    universities,
    loading,
    error,
    refetch: fetchUniversities,
    createUniversity,
  };
}
