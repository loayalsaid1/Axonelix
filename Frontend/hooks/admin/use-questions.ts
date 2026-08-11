import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { StatementFormat } from '@/lib/types/questions';

export interface QuestionOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  questionType: 'mcq' | 'written';
  statement: string;
  statementFormat: StatementFormat;
  explanation: any;
  explanationIsLegacyFormat?: boolean;
  lessonId?: string | null;
  chapterId?: string | null;
  oldExamId?: string | null;
  isMisc: boolean;
  questionOptions: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedQuestions {
  data: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useQuestions() {
  const authFetch = useApiFetch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authFetch<PaginatedQuestions>('/questions?limit=100');
      setQuestions(
        (data.data || []).map((q) => ({
          ...q,
          id: String(q.id),
          lessonId: q.lessonId != null ? String(q.lessonId) : null,
          chapterId: q.chapterId != null ? String(q.chapterId) : null,
          oldExamId: q.oldExamId != null ? String(q.oldExamId) : null,
          questionOptions: (q.questionOptions || []).map((o) => ({ ...o, id: String(o.id) })),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'));
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const deleteQuestion = useCallback(async (questionId: string) => {
    try {
      await authFetch(`/questions/${questionId}`, { method: 'DELETE' });
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      return true;
    } catch (err) {
      console.error('Failed to delete question:', err);
      return false;
    }
  }, [authFetch]);

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
