import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';

export interface OldExam {
  id: string;
  examType: 'final' | 'midterm' | 'tpl' | 'flipped';
  year: number;
  universityId: string;
  moduleId: string;
  moduleType: 'theoretical' | 'practical';
  createdAt: string;
  // joined relations
  module?: { id: string; name: string };
  university?: { id: string; name: string };
}

export function useOldExams() {
  const [exams, setExams] = useState<OldExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<OldExam[]>('/questions/old-exams');
      setExams(
        data.map((e) => ({
          ...e,
          id: String(e.id),
          universityId: String((e as any).universityId),
          moduleId: String((e as any).moduleId),
          module: e.module ? { id: String(e.module.id), name: e.module.name } : undefined,
          university: e.university ? { id: String(e.university.id), name: e.university.name } : undefined,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch old exams'));
      console.error('Failed to fetch old exams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExam = useCallback(async (examId: string) => {
    try {
      await apiFetch(`/questions/old-exams/${examId}`, { method: 'DELETE' });
      setExams((prev) => prev.filter((e) => e.id !== examId));
      return true;
    } catch (err) {
      console.error('Failed to delete old exam:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return {
    exams,
    loading,
    error,
    refetch: fetchExams,
    deleteExam,
  };
}
