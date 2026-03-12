import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface ExamQuestion {
  id: string;
  questionType: string;
  statement: string;
  questionOptions: { id: string; optionText: string; isCorrect: boolean }[];
  createdAt: string;
}

interface PaginatedQuestions {
  data: ExamQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useExamQuestions(examId: string) {
  const authFetch = useApiFetch();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<PaginatedQuestions>(`/questions?oldExamId=${examId}&limit=100`);
      setQuestions(
        (data.data || []).map((q) => ({
          ...q,
          id: String(q.id),
          questionOptions: (q.questionOptions || []).map((o) => ({ ...o, id: String(o.id) })),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch exam questions'));
      console.error('Failed to fetch exam questions:', err);
    } finally {
      setLoading(false);
    }
  }, [examId, authFetch]);

  const removeQuestion = useCallback(
    async (questionId: string) => {
      try {
        await authFetch(`/questions/${questionId}`, {
          method: 'PATCH',
          body: { oldExamId: null },
        });
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        return true;
      } catch (err) {
        console.error('Failed to remove question:', err);
        return false;
      }
    },
    [authFetch]
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
