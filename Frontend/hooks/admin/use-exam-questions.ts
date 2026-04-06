import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface ExamQuestion {
  id: string;
  questionType: string;
  statement: string;
  questionOptions: { id: string; optionText: string; isCorrect: boolean }[];
  explanation?: any;
  lessonId?: string | null;
  chapterId?: string | null;
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
        (data.data || []).map((q: any) => ({
          ...q,
          id: String(q.id),
          lessonId: q.lessonId,
          chapterId: q.chapterId,
          questionOptions: (q.questionOptions || []).map((o: any) => ({ ...o, id: o.id })),
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
        await authFetch(`/questions/${questionId}/old-exam`, {
          method: 'DELETE',
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
