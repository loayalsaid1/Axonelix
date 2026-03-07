import { useState, useEffect, useCallback } from 'react';

export interface University {
  id: string;
  name: string;
  created_at?: string;
}

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUniversities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/universities');
      const data = await response.json();
      setUniversities(data.universities || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch universities'));
      console.error('Failed to fetch universities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUniversity = useCallback(async (name: string) => {
    try {
      const response = await fetch('/api/admin/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUniversities((prev) => [...prev, data.university]);
        return data.university;
      }
      return null;
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
