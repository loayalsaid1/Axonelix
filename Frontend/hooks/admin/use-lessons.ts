import { useState, useEffect, useCallback } from 'react';

export interface Lesson {
  id: string;
  name: string;
  description: string;
  content: string;
  order_index: number;
  created_at: string;
}

export function useLessons(chapterId: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLessons = useCallback(async () => {
    if (!chapterId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/chapters/${chapterId}/lessons`);
      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch lessons'));
      console.error('Failed to fetch lessons:', err);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  const deleteLesson = useCallback(async (lessonId: string) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      return false;
    }
  }, []);

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
