import { useState, useEffect, useCallback } from 'react';

export interface Exam {
  id: string;
  exam_type: string;
  year: number;
  university_id?: string;
  university_name?: string;
  module_id?: string;
  module_name?: string;
  module_type?: 'theoretical' | 'practical';
}

export function useExam(examId: string) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExam = useCallback(async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/old-exams/${examId}`);
      const data = await response.json();
      setExam(data.exam);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exam'));
      console.error('Failed to fetch exam:', err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

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
