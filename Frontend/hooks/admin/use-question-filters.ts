import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { Question } from './use-questions';

export interface Module {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  type: string;
  moduleId: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
}

export interface Lesson {
  id: string;
  name: string;
  chapterId: string;
}

export interface QuestionFilters {
  search?: string;
  moduleId?: string;
  subjectIds?: string[];
  chapterIds?: string[];
  lessonIds?: string[];
  isMisc?: boolean;
  questionType?: 'mcq' | 'written';
  sortOrder?: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterOptions {
  modules: Module[];
  subjects: Subject[];
  chapters: Chapter[];
  lessons: Lesson[];
}

/**
 * Custom hook to manage question filtering with cascading filter options
 */
export function useQuestionFilters() {
  const authFetch = useApiFetch();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    modules: [],
    subjects: [],
    chapters: [],
    lessons: [],
  });

  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    moduleId: '',
    subjectIds: [],
    chapterIds: [],
    lessonIds: [],
    isMisc: undefined,
    questionType: undefined,
    sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setOptionsLoading(true);
      const data = await authFetch<any[]>('/materials/modules');
      setFilterOptions((prev) => ({
        ...prev,
        modules: data.map((m) => ({ id: String(m.id), name: m.name })),
      }));
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setOptionsLoading(false);
    }
  };

  const fetchSubjectsForModule = useCallback(async (moduleId: string) => {
    if (!moduleId) return;
    try {
      const data = await authFetch<any[]>(`/materials/subjects?moduleId=${moduleId}`);
      setFilterOptions((prev) => ({
        ...prev,
        subjects: data.map((s) => ({ id: String(s.id), name: s.name, type: s.type, moduleId: String(s.moduleId) })),
        chapters: [],
        lessons: [],
      }));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  }, [authFetch]);

  const fetchChaptersForSubjects = useCallback(async (subjectIds: string[]) => {
    if (!subjectIds.length) return;
    try {
      const results = await Promise.all(
        subjectIds.map((id) => authFetch<any[]>(`/materials/subjects/${id}/chapters`))
      );
      const chapters = results.flat().map((c) => ({ id: String(c.id), name: c.name, subjectId: String(c.subjectId) }));
      setFilterOptions((prev) => ({ ...prev, chapters, lessons: [] }));
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    }
  }, [authFetch]);

  const fetchLessonsForChapters = useCallback(async (chapterIds: string[]) => {
    if (!chapterIds.length) return;
    try {
      const results = await Promise.all(
        chapterIds.map((id) => authFetch<any[]>(`/materials/chapters/${id}/lessons`))
      );
      const lessons = results.flat().map((l) => ({ id: String(l.id), name: l.name, chapterId: String(l.chapterId) }));
      setFilterOptions((prev) => ({ ...prev, lessons }));
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  }, [authFetch]);

  const getFilteredSubjects = useCallback(() => {
    if (!filters.moduleId) return [];
    return filterOptions.subjects.filter((s) => s.moduleId === filters.moduleId);
  }, [filters.moduleId, filterOptions.subjects]);

  const getFilteredChapters = useCallback(() => {
    if (!filters.subjectIds || filters.subjectIds.length === 0) return [];
    return filterOptions.chapters.filter((c) => filters.subjectIds!.includes(c.subjectId));
  }, [filters.subjectIds, filterOptions.chapters]);

  const getFilteredLessons = useCallback(() => {
    if (!filters.chapterIds || filters.chapterIds.length === 0) return [];
    return filterOptions.lessons.filter((l) => filters.chapterIds!.includes(l.chapterId));
  }, [filters.chapterIds, filterOptions.lessons]);

  const updateFilter = useCallback((key: keyof QuestionFilters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      (newFilters as any)[key] = value;

      if (key === 'moduleId') {
        newFilters.subjectIds = [];
        newFilters.chapterIds = [];
        newFilters.lessonIds = [];
        if (value) fetchSubjectsForModule(value);
      } else if (key === 'subjectIds') {
        newFilters.chapterIds = [];
        newFilters.lessonIds = [];
        if (value?.length) fetchChaptersForSubjects(value);
      } else if (key === 'chapterIds') {
        newFilters.lessonIds = [];
        if (value?.length) fetchLessonsForChapters(value);
      }

      return newFilters;
    });
  }, [fetchSubjectsForModule, fetchChaptersForSubjects, fetchLessonsForChapters]);

  const fetchQuestions = useCallback(
    async (pageOverride?: number, limitOverride?: number) => {
      try {
        setLoading(true);

        const targetPage = pageOverride ?? pagination.page;
        const targetLimit = limitOverride ?? pagination.limit;

        const body: Record<string, any> = {};
        if (filters.search) body.searchQuery = filters.search;
        if (filters.moduleId) body.moduleIds = [Number(filters.moduleId)];
        if (filters.subjectIds?.length) body.subjectIds = filters.subjectIds.map(Number);
        if (filters.chapterIds?.length) body.chapterIds = filters.chapterIds.map(Number);
        if (filters.lessonIds?.length) body.lessonIds = filters.lessonIds.map(Number);
        if (filters.isMisc !== undefined) body.isMisc = filters.isMisc;
        if (filters.questionType) body.questionType = filters.questionType;
        if (filters.sortOrder) body.sortOrder = filters.sortOrder;

        const data = await authFetch<{ data: any[]; total: number }>(
          `/questions/filter?page=${targetPage}&limit=${targetLimit}`,
          {
            method: 'POST',
            body,
          },
        );
        setQuestions(
          (data.data || []).map((q) => ({
            ...q,
            id: String(q.id),
            questionOptions: (q.questionOptions || q.options || []).map((o: any) => ({
              ...o,
              id: String(o.id),
            })),
          })),
        );

        setPagination({
          page: targetPage,
          limit: targetLimit,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / targetLimit),
        });
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.page, pagination.limit, authFetch],
  );

  const goToPage = useCallback(
    (page: number) => {
      fetchQuestions(page);
    },
    [fetchQuestions],
  );

  const setLimit = useCallback(
    (limit: number) => {
      fetchQuestions(1, limit);
    },
    [fetchQuestions],
  );

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      moduleId: '',
      subjectIds: [],
      chapterIds: [],
      lessonIds: [],
      isMisc: undefined,
      questionType: undefined,
      sortOrder: 'desc',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFilterOptions((prev) => ({ ...prev, subjects: [], chapters: [], lessons: [] }));
  }, []);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.moduleId ||
      (filters.subjectIds && filters.subjectIds.length > 0) ||
      (filters.chapterIds && filters.chapterIds.length > 0) ||
      (filters.lessonIds && filters.lessonIds.length > 0) ||
      filters.isMisc !== undefined ||
      filters.questionType !== undefined ||
      // Hmm, sortOrder is technically a filter but since it defaults to 'desc' it doesn't feel like an "active" filter unless it's been changed to 'asc'
      filters.sortOrder === 'asc'
    );
  }, [filters]);

  return {
    // Filter options
    filterOptions,
    optionsLoading,

    // Filter state
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),

    // Pagination
    pagination,
    goToPage,
    setLimit,

    // Cascading filter helpers
    getFilteredSubjects,
    getFilteredChapters,
    getFilteredLessons,

    // Questions
    questions,
    loading,
    fetchQuestions,
    refetch: fetchQuestions,
  };
}
