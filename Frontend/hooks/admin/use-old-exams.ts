import { useState, useEffect, useCallback } from 'react';

export interface OldExam {
  id: string;
  exam_type: 'final' | 'midterm' | 'tpl' | 'flipped';
  year: number;
  university_id: string;
  university_name?: string;
  module_id: string;
  module_name?: string;
  module_type: 'theoretical' | 'practical';
  created_at: string;
}

export function useOldExams() {
  const [exams, setExams] = useState<OldExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/old-exams');
      const data = await response.json();
      setExams(data.exams || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch old exams'));
      console.error('Failed to fetch old exams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteExam = useCallback(async (examId: string) => {
    try {
      const response = await fetch(`/api/admin/old-exams/${examId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExams((prev) => prev.filter((e) => e.id !== examId));
        return true;
      }
      return false;
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
