import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import type { QuestionType } from '@/lib/types/questions';

export interface ExamQuestion {
  id: string;
  questionType: QuestionType;
  statement: string;
  statementFormat: 'text' | 'tiptap_json';
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

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useExamQuestions(
  examId: string,
  questionType?: QuestionType,
) {
  const authFetch = useApiFetch();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchQuestions = useCallback(
    async (
      pageOverride?: number,
      limitOverride?: number,
      questionTypeOverride?: QuestionType,
    ) => {
      if (!examId) return;

      try {
        setLoading(true);
        setError(null);

        const targetPage = pageOverride ?? pagination.page;
        const targetLimit = limitOverride ?? pagination.limit;

        const query = new URLSearchParams({
          oldExamId: examId,
          page: String(targetPage),
          limit: String(targetLimit),
        });

        const targetQuestionType = questionTypeOverride ?? questionType;
        if (targetQuestionType) {
          query.set('questionType', targetQuestionType);
        }

        const data = await authFetch<PaginatedQuestions>(
          `/questions?${query.toString()}`,
        );
        setQuestions(
          (data.data || []).map((q: any) => ({
            ...q,
            id: String(q.id),
            lessonId: q.lessonId,
            chapterId: q.chapterId,
            questionOptions: (q.questionOptions || []).map((o: any) => ({ ...o, id: String(o.id) })),
          })),
        );
        setPagination({
          page: data.page ?? targetPage,
          limit: data.limit ?? targetLimit,
          total: data.total ?? 0,
          totalPages: data.totalPages ?? Math.ceil((data.total ?? 0) / targetLimit),
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch exam questions'));
        console.error('Failed to fetch exam questions:', err);
      } finally {
        setLoading(false);
      }
    },
    [examId, authFetch, pagination.page, pagination.limit, questionType],
  );

  const goToPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({ ...prev, page }));
    },
    [],
  );

  const setLimit = useCallback(
    (limit: number) => {
      setPagination((prev) => ({ ...prev, page: 1, limit }));
    },
    [],
  );

  const removeQuestion = useCallback(
    async (questionId: string) => {
      try {
        await authFetch(`/questions/${questionId}/old-exam`, {
          method: 'DELETE',
        });
        const nextTotal = Math.max(0, pagination.total - 1);
        const maxPageAfterDelete = Math.max(1, Math.ceil(nextTotal / pagination.limit));
        const nextPage = Math.min(pagination.page, maxPageAfterDelete);
        await fetchQuestions(nextPage, pagination.limit);
        return true;
      } catch (err) {
        console.error('Failed to remove question:', err);
        return false;
      }
    },
    [authFetch, fetchQuestions, pagination.total, pagination.limit, pagination.page],
  );

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    pagination,
    goToPage,
    setLimit,
    refetch: fetchQuestions,
    removeQuestion,
  };
}
