import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import type { OldExam } from './use-old-exams';

// Re-use the same type
export type Exam = OldExam;

export function useExam(examId: string) {
  const authFetch = useApiFetch();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExam = useCallback(async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<Exam>(`/questions/old-exams/${examId}`);
      setExam({
        ...data,
        id: String(data.id),
        universityId: String(data.universityId),
        moduleId: String(data.moduleId),
        module: data.module ? { id: String(data.module.id), name: data.module.name } : undefined,
        university: data.university ? { id: String(data.university.id), name: data.university.name } : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exam'));
      console.error('Failed to fetch exam:', err);
    } finally {
      setLoading(false);
    }
  }, [examId, authFetch]);

  useEffect(() => {
    fetchExam();
  }, [fetchExam]);

  return {
    exam,
    loading,
    error,
    refetch: fetchExam,
  };
}
