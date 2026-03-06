import { useState, useEffect, useCallback } from 'react';

export interface ExamQuestion {
  id: string;
  question_type: string;
  statement: string;
  options: { id: string; option_text: string; is_correct: boolean }[];
  created_at: string;
}

export function useExamQuestions(examId: string) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/old-exams/${examId}/questions`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exam questions'));
      console.error('Failed to fetch exam questions:', err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  const removeQuestion = useCallback(
    async (questionId: string) => {
      try {
        const response = await fetch(`/api/admin/old-exams/${examId}/questions/${questionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setQuestions((prev) => prev.filter((q) => q.id !== questionId));
          return true;
        }
        return false;
      } catch (err) {
        console.error('Failed to remove question:', err);
        return false;
      }
    },
    [examId]
  );

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
    removeQuestion,
  };
}
