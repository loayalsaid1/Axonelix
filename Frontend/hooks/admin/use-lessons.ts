import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface Lesson {
  id: string;
  name: string;
  description: string | null;
  content: Record<string, unknown> | null;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useLessons(chapterId: string) {
  const authFetch = useApiFetch();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!chapterId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<Lesson[]>(`/materials/chapters/${chapterId}/lessons`);
      setLessons(data.map((l) => ({ ...l, id: String(l.id) })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch lessons'));
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [chapterId, authFetch]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    try {
      await authFetch(`/materials/lessons/${lessonId}`, { method: 'DELETE' });
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      return true;
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      return false;
    }
  }, [authFetch]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons,
    deleteLesson,
  };
}
