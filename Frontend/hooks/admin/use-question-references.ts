import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface QuestionReference {
  id: number;
  name: string;
}

export function useQuestionReferences() {
  const authFetch = useApiFetch();
  const [references, setReferences] = useState<QuestionReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<QuestionReference[]>('/questions/references');
      setReferences(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch references');
      setError(error);
      console.error('Failed to fetch references:', error);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const createReference = useCallback(async (name: string) => {
    try {
      const data = await authFetch<QuestionReference>('/questions/references', {
        method: 'POST',
        body: { name },
      });
      setReferences((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err) {
      console.error('Failed to create reference:', err);
      return null;
    }
  }, [authFetch]);

  useEffect(() => {
    fetchReferences();
  }, [fetchReferences]);

  return {
    references,
    loading,
    error,
    refetch: fetchReferences,
    createReference,
  };
}
