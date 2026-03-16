'use client';

import { useParams } from 'next/navigation';
import { ChapterHeader } from '@/components/admin/materials/chapter-header';
import { LessonsList } from '@/components/admin/materials/lessons-list';

export default function LessonsPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;

  return (
    <div className="p-8">
      <ChapterHeader
        chapterId={chapterId}
        backHref={`/admin/materials/${moduleId}/${subjectId}`}
        backLabel="Back to Chapters"
      />
      <LessonsList moduleId={moduleId} subjectId={subjectId} chapterId={chapterId} />
    </div>
  );
}
