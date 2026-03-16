'use client';

import { useParams } from 'next/navigation';
import { SubjectHeader } from '@/components/admin/materials/subject-header';
import { ChaptersList } from '@/components/admin/materials/chapters-list';

export default function ChaptersPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const subjectId = params.subjectId as string;

  return (
    <div className="p-8">
      <SubjectHeader
        subjectId={subjectId}
        backHref={`/admin/materials/${moduleId}`}
        backLabel="Back to Subjects"
      />
      <ChaptersList moduleId={moduleId} subjectId={subjectId} />
    </div>
  );
}
