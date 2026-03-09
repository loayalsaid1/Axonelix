import { useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';
import { OldExam } from './use-old-exams';

export interface OldExamParams {
  universityId: string;
  moduleId: string;
  moduleType: 'theoretical' | 'practical';
  examType: 'final' | 'midterm' | 'tpl' | 'flipped';
  year: number;
}

export function useOldExamManager(existingExams: OldExam[]) {
  const findExistingExam = useCallback(
    (params: OldExamParams): OldExam | null => {
      return (
        existingExams.find(
          (exam) =>
            exam.moduleId === params.moduleId &&
            exam.moduleType === params.moduleType &&
            exam.universityId === params.universityId &&
            exam.year === params.year &&
            exam.examType === params.examType
        ) || null
      );
    },
    [existingExams]
  );

  const createOldExam = useCallback(async (params: OldExamParams): Promise<OldExam | null> => {
    try {
      const data = await apiFetch<any>('/questions/old-exams', {
        method: 'POST',
        body: {
          examType: params.examType,
          moduleId: Number(params.moduleId),
          moduleType: params.moduleType,
          universityId: Number(params.universityId),
          year: params.year,
        },
      });
      return {
        ...data,
        id: String(data.id),
        universityId: String(data.universityId),
        moduleId: String(data.moduleId),
        module: data.module ? { id: String(data.module.id), name: data.module.name } : undefined,
        university: data.university ? { id: String(data.university.id), name: data.university.name } : undefined,
      };
    } catch (error) {
      console.error('Failed to create old exam:', error);
      return null;
    }
  }, []);

  const findOrCreateOldExam = useCallback(
    async (params: OldExamParams): Promise<string | null> => {
      const existing = findExistingExam(params);
      if (existing) {
        return existing.id;
      }
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
