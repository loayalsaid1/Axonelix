import { useCallback } from 'react';
import { OldExam } from './use-old-exams';

export interface OldExamParams {
  university_id: string;
  module_id: string;
  module_type: 'theoretical' | 'practical';
  exam_type: 'final' | 'midterm' | 'tpl' | 'flipped';
  year: number;
}

export function useOldExamManager(existingExams: OldExam[]) {
  const findExistingExam = useCallback(
    (params: OldExamParams): OldExam | null => {
      return (
        existingExams.find(
          (exam) =>
            exam.module_id === params.module_id &&
            exam.module_type === params.module_type &&
            exam.university_id === params.university_id &&
            exam.year === params.year &&
            exam.exam_type === params.exam_type
        ) || null
      );
    },
    [existingExams]
  );

  const createOldExam = useCallback(async (params: OldExamParams): Promise<OldExam | null> => {
    try {
      const response = await fetch('/api/admin/old-exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        return data.exam;
      }
      return null;
    } catch (error) {
      console.error('Failed to create old exam:', error);
      return null;
    }
  }, []);

  const findOrCreateOldExam = useCallback(
    async (params: OldExamParams): Promise<string | null> => {
      // Check if exists
      const existing = findExistingExam(params);
      if (existing) {
        return existing.id;
      }

      // Create new
      const newExam = await createOldExam(params);
      return newExam?.id || null;
    },
    [findExistingExam, createOldExam]
  );

  return {
    findExistingExam,
    createOldExam,
    findOrCreateOldExam,
  };
}
