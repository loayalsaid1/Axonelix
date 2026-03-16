'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { useApiFetch } from '@/hooks/use-api-fetch';

interface Subject {
  id: string;
  name: string;
  description: string;
}

interface SubjectHeaderProps {
  subjectId: string;
  backHref?: string;
  backLabel?: string;
}

export function SubjectHeader({ subjectId, backHref, backLabel = 'Back' }: SubjectHeaderProps) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const authFetch = useApiFetch();

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const data = await authFetch<Subject>(`/materials/subjects/${subjectId}`);
        setSubject(data);
      } catch (error) {
        console.error('Failed to fetch subject:', error);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId, authFetch]);

  if (!subject) return null;

  return (
    <AdminPageHeader
      title={subject.name}
      description={subject.description}
      backHref={backHref}
      backLabel={backLabel}
      className="mb-8"
    />
  );
}
