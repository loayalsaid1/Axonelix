import { useState, useEffect, useCallback } from 'react';

export interface Question {
  id: string;
  question_type: 'mcq' | 'written';
  statement: string;
  explanation: any;
  lesson_id?: string;
  chapter_id?: string;
  old_exam_id?: string;
  is_misc: boolean;
  options: { id: string; option_text: string; is_correct: boolean }[];
  created_at: string;
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/questions');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'));
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQuestion = useCallback(async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete question:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
    deleteQuestion,
  };
}
