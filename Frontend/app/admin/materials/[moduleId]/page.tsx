'use client';

import { useParams } from 'next/navigation';
import { ModuleHeader } from '@/components/admin/materials/module-header';
import { SubjectsList } from '@/components/admin/materials/subjects-list';

export default function ModuleDetailsPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;

  return (
    <div className="p-8">
      <ModuleHeader moduleId={moduleId} backHref="/admin/materials" backLabel="Back to Materials" />
      <SubjectsList moduleId={moduleId} />
    </div>
  );
}
