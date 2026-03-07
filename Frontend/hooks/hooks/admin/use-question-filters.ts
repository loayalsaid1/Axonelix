import { useState, useEffect, useCallback } from 'react';
import { Question } from './use-questions';

export interface Module {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  type: string;
  module_id: string;
}

export interface Chapter {
  id: string;
  name: string;
  subject_id: string;
}

export interface Lesson {
  id: string;
  name: string;
  chapter_id: string;
}

export interface QuestionFilters {
  search?: string;
  moduleId?: string;
  subjectIds?: string[]; // Support multiple subjects
  chapterIds?: string[]; // Support multiple chapters
  lessonIds?: string[]; // Support multiple lessons
  isMisc?: boolean;
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
  // Filter options state
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    modules: [],
    subjects: [],
    chapters: [],
    lessons: [],
  });
  
  // Filter state
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    moduleId: '',
    subjectIds: [],
    chapterIds: [],
    lessonIds: [],
    isMisc: undefined,
  });
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      setOptionsLoading(true);
      const response = await fetch('/api/admin/questions/filter-options');
      const data = await response.json();
      setFilterOptions({
        modules: data.modules || [],
        subjects: data.subjects || [],
        chapters: data.chapters || [],
        lessons: data.lessons || [],
      });
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    } finally {
      setOptionsLoading(false);
    }
  };

  // Get filtered subjects based on selected module
  const getFilteredSubjects = useCallback(() => {
    if (!filters.moduleId) return [];
    return filterOptions.subjects.filter(s => s.module_id === filters.moduleId);
  }, [filters.moduleId, filterOptions.subjects]);

  // Get filtered chapters based on selected subjects (supports multiple)
  const getFilteredChapters = useCallback(() => {
    if (!filters.subjectIds || filters.subjectIds.length === 0) return [];
    return filterOptions.chapters.filter(c => 
      filters.subjectIds!.includes(c.subject_id)
    );
  }, [filters.subjectIds, filterOptions.chapters]);

  // Get filtered lessons based on selected chapters
  const getFilteredLessons = useCallback(() => {
    if (!filters.chapterIds || filters.chapterIds.length === 0) return [];
    return filterOptions.lessons.filter(l => 
      filters.chapterIds!.includes(l.chapter_id)
    );
  }, [filters.chapterIds, filterOptions.lessons]);

  // Update filters with cascading reset
  const updateFilter = useCallback((key: keyof QuestionFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      // Update the specified filter
      (newFilters as any)[key] = value;
      
      // Cascade reset for dependent filters
      if (key === 'moduleId') {
        newFilters.subjectIds = [];
        newFilters.chapterIds = [];
        newFilters.lessonIds = [];
      } else if (key === 'subjectIds') {
        newFilters.chapterIds = [];
        newFilters.lessonIds = [];
      } else if (key === 'chapterIds') {
        newFilters.lessonIds = [];
      }
      
      return newFilters;
    });
  }, []);

  // Fetch questions with current filters
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.isMisc !== undefined) params.append('isMisc', String(filters.isMisc));
      
      // For multiple subjects, send as comma-separated values
      if (filters.subjectIds && filters.subjectIds.length > 0) {
        params.append('subjectIds', filters.subjectIds.join(','));
      }
      
      // For multiple chapters, send as comma-separated values
      if (filters.chapterIds && filters.chapterIds.length > 0) {
        params.append('chapterIds', filters.chapterIds.join(','));
      }
      
      // For multiple lessons, send as comma-separated values
      if (filters.lessonIds && filters.lessonIds.length > 0) {
        params.append('lessonIds', filters.lessonIds.join(','));
      }
      
      const response = await fetch(`/api/admin/questions?${params.toString()}`);
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      moduleId: '',
      subjectIds: [],
      chapterIds: [],
      lessonIds: [],
      isMisc: undefined,
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.search ||
      filters.moduleId ||
      (filters.subjectIds && filters.subjectIds.length > 0) ||
      (filters.chapterIds && filters.chapterIds.length > 0) ||
      (filters.lessonIds && filters.lessonIds.length > 0) ||
      filters.isMisc !== undefined
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
