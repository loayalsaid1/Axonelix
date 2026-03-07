'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';

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

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`/api/admin/chapters/${chapterId}`);
        const data = await response.json();
        setChapter(data.chapter);
      } catch (error) {
        console.error('Failed to fetch chapter:', error);
      }
    };

    if (chapterId) {
      fetchChapter();
    }
  }, [chapterId]);

  if (!chapter) return null;

  return (
    <>
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <AdminPageHeader
        title={chapter.name}
        description={chapter.description}
        className="mb-8"
      />
    </>
  );
}
