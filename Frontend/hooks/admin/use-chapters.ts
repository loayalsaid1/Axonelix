import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface Chapter {
  id: string;
  name: string;
  description: string | null;
  isMiscellaneous: boolean;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useChapters(subjectId: string) {
  const authFetch = useApiFetch();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChapters = useCallback(async () => {
    if (!subjectId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<Chapter[]>(`/materials/subjects/${subjectId}/chapters`);
      setChapters(data.map((c) => ({ ...c, id: String(c.id) })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch chapters'));
      console.error('Failed to fetch chapters:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId, authFetch]);

  const deleteChapter = useCallback(async (chapterId: string) => {
    try {
      await authFetch(`/materials/chapters/${chapterId}`, { method: 'DELETE' });
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      return true;
    } catch (err) {
      console.error('Failed to delete chapter:', err);
      return false;
    }
  }, [authFetch]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return {
    chapters,
    loading,
    error,
    refetch: fetchChapters,
    deleteChapter,
  };
}
