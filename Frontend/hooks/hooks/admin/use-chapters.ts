import { useState, useEffect, useCallback } from 'react';

export interface Chapter {
  id: string;
  name: string;
  description: string;
  is_miscellaneous: boolean;
  order_index: number;
  created_at: string;
}

export function useChapters(subjectId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchChapters = useCallback(async () => {
    if (!subjectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/subjects/${subjectId}/chapters`);
      const data = await response.json();
      setChapters(data.chapters || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch chapters'));
      console.error('Failed to fetch chapters:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  const deleteChapter = useCallback(async (chapterId: string) => {
    try {
      const response = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChapters((prev) => prev.filter((c) => c.id !== chapterId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete chapter:', err);
      return false;
    }
  }, []);

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
