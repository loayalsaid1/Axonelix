'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';

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

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await fetch(`/api/admin/subjects/${subjectId}`);
        const data = await response.json();
        setSubject(data.subject);
      } catch (error) {
        console.error('Failed to fetch subject:', error);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  if (!subject) return null;

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
        title={subject.name}
        description={subject.description}
        className="mb-8"
      />
    </>
  );
}
