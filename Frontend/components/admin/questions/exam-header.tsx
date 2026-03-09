'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useExam } from '@/hooks/admin/use-exam';

interface ExamHeaderProps {
  examId: string;
  backHref?: string;
  backLabel?: string;
}

export function ExamHeader({ examId, backHref = '/admin/questions', backLabel = 'Back to Old Exams' }: ExamHeaderProps) {
  const { exam, loading } = useExam(examId);

  if (loading || !exam) return null;

  return (
    <>
      <Link
        href={backHref}
        className="flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 uppercase">
          {exam.examType} {exam.year}
        </h1>
        <p className="text-muted-foreground mb-4">Exam Collection ID: {exam.id}</p>
      </div>
    </>
  );
}
