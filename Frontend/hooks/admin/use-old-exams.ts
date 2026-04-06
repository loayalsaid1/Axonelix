import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import type { ExamType, SubjectType } from '@/lib/types/old-exams';
import { OLD_EXAMS_API_QUERY_KEYS } from '@/lib/old-exams/query-params';
import {
  mapOldExamRecordToAdminOldExam,
  type OldExamRecord,
} from './old-exams.mapper';

export interface OldExam {
  id: string;
  examType: ExamType;
  year: number;
  universityId: string;
  moduleId: string;
  moduleType: SubjectType;
  createdAt: string;
  // joined relations
  module?: { id: string; name: string };
  university?: { id: string; name: string };
}

export interface OldExamFilters {
  moduleId?: number;
  subjectType?: SubjectType;
  examType?: ExamType;
}

export function useOldExams(filters: OldExamFilters = {}) {
  const authFetch = useApiFetch();
  const [exams, setExams] = useState<OldExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const qs = new URLSearchParams();
      if (filters.moduleId != null) {
        qs.set(OLD_EXAMS_API_QUERY_KEYS.moduleId, String(filters.moduleId));
      }
      if (filters.subjectType) {
        qs.set(OLD_EXAMS_API_QUERY_KEYS.moduleType, filters.subjectType);
      }
      if (filters.examType) {
        qs.set(OLD_EXAMS_API_QUERY_KEYS.examType, filters.examType);
      }
      const query = qs.toString();

      const data = await authFetch<OldExamRecord[]>(
        `/questions/old-exams${query ? `?${query}` : ''}`
      );
      setExams(data.map(mapOldExamRecordToAdminOldExam));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch old exams'));
      console.error('Failed to fetch old exams:', err);
    } finally {
      setLoading(false);
    }
  }, [authFetch, filters.examType, filters.moduleId, filters.subjectType]);

  const deleteExam = useCallback(async (examId: string) => {
    try {
      await authFetch(`/questions/old-exams/${examId}`, { method: 'DELETE' });
      setExams((prev) => prev.filter((e) => e.id !== examId));
      return true;
    } catch (err) {
      console.error('Failed to delete old exam:', err);
      return false;
    }
  }, [authFetch]);

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
