import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';

export interface Subject {
  id: string;
  name: string;
  description: string | null;
  type: 'theoretical' | 'practical';
  moduleId: string;
  orderIndex: number | null;
  createdAt: string;
  updatedAt: string;
}

export function useSubjects(moduleId: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubjects = useCallback(async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Subject[]>(`/materials/subjects?moduleId=${moduleId}`);
      setSubjects(data.map((s) => ({ ...s, id: String(s.id), moduleId: String((s as any).moduleId) })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subjects'));
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  const deleteSubject = useCallback(async (subjectId: string) => {
    try {
      await apiFetch(`/materials/subjects/${subjectId}`, { method: 'DELETE' });
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      return true;
    } catch (err) {
      console.error('Failed to delete subject:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
    deleteSubject,
  };
}
