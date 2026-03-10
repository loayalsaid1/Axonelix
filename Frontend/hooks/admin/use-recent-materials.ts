'use client';

import { useState, useEffect } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import type { RecentMaterial } from '@/lib/admin-db';

export function useRecentMaterials(limit: number = 10) {
  const authFetch = useApiFetch();
  const [materials, setMaterials] = useState<RecentMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await authFetch<any[]>(`/materials/lessons/recent?limit=${limit}`);
      const mapped: RecentMaterial[] = (data || []).map((lesson: any) => ({
        id: String(lesson.id),
        name: lesson.name,
        type: 'lesson' as const,
        description: lesson.description ?? undefined,
        updatedAt: lesson.updatedAt,
        createdAt: lesson.createdAt,
        moduleId: lesson.chapter?.subject?.module ? String(lesson.chapter.subject.module.id) : undefined,
        moduleName: lesson.chapter?.subject?.module?.name,
        subjectId: lesson.chapter?.subject ? String(lesson.chapter.subject.id) : undefined,
        subjectName: lesson.chapter?.subject?.name,
        chapterId: lesson.chapter ? String(lesson.chapter.id) : undefined,
        chapterName: lesson.chapter?.name,
      }));
      setMaterials(mapped);
    } catch (error) {
      console.error('Failed to fetch recent materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [limit, authFetch]);

  return { materials, loading, refetch: fetchMaterials };
}
