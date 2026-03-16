'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { useApiFetch } from '@/hooks/use-api-fetch';

interface Chapter {
  id: string;
  name: string;
  description: string;
}

interface ChapterHeaderProps {
  chapterId: string;
  backHref?: string;
  backLabel?: string;
}

export function ChapterHeader({ chapterId, backHref, backLabel = 'Back' }: ChapterHeaderProps) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const authFetch = useApiFetch();

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const data = await authFetch<Chapter>(`/materials/chapters/${chapterId}`);
        setChapter(data);
      } catch (error) {
        console.error('Failed to fetch chapter:', error);
      }
    };

    if (chapterId) {
      fetchChapter();
    }
  }, [chapterId, authFetch]);

  if (!chapter) return null;

  return (
    <AdminPageHeader
      title={chapter.name}
      description={chapter.description}
      backHref={backHref}
      backLabel={backLabel}
      className="mb-8"
    />
  );
}
