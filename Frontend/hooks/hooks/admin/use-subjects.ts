import { useState, useEffect, useCallback } from 'react';

export interface Subject {
  id: string;
  name: string;
  description: string;
  type: 'theoretical' | 'practical';
  order_index: number;
  created_at: string;
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
      const response = await fetch(`/api/admin/modules/${moduleId}/subjects`);
      const data = await response.json();
      setSubjects(data.subjects || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subjects'));
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  const deleteSubject = useCallback(async (subjectId: string) => {
    try {
      const response = await fetch(`/api/admin/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
        return true;
      }
      return false;
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
