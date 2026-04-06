'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, BookOpen, GraduationCap, Hash, Calendar } from 'lucide-react';
import { useExam } from '@/hooks/admin/use-exam';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface ExamHeaderProps {
  examId: string;
  backHref?: string;
  backLabel?: string;
}

type MetaBadgeVariant = 'outline' | 'secondary';

interface MetaBadgeProps {
  children: ReactNode;
  variant?: MetaBadgeVariant;
  className?: string;
}

const META_BADGE_BASE_CLASS = 'h-8 gap-1.5 px-3';
const META_BADGE_ICON_CLASS = 'h-3.5 w-3.5';

function MetaBadge({ children, variant = 'outline', className = '' }: MetaBadgeProps) {
  return (
    <Badge variant={variant} className={`${META_BADGE_BASE_CLASS} ${className}`.trim()}>
      {children}
    </Badge>
  );
}

export function ExamHeader({ examId, backHref = '/admin/questions?tab=exams', backLabel = 'Back to Old Exams' }: ExamHeaderProps) {
  const { exam, loading } = useExam(examId);

  if (loading) {
    return (
      <div className="space-y-4 mb-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    );
  }

  if (!exam) return null;

  return (
    <>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        {backLabel}
      </Link>

      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Old Exam</h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {exam.module?.name && (
                <MetaBadge variant="secondary" className="text-sm font-medium">
                  <BookOpen className={META_BADGE_ICON_CLASS} />
                  {exam.module.name}
                </MetaBadge>
              )}

              {exam.university?.name && (
                <MetaBadge variant="secondary" className="text-sm font-medium">
                  <GraduationCap className={META_BADGE_ICON_CLASS} />
                  {exam.university.name}
                </MetaBadge>
              )}

              <MetaBadge className="text-sm font-semibold uppercase">
                {exam.examType}
              </MetaBadge>

              <MetaBadge className="text-sm font-semibold border-primary/20 bg-primary/5 text-primary">
                <Calendar className={META_BADGE_ICON_CLASS} />
                {exam.year}
              </MetaBadge>

              <MetaBadge className="text-xs text-muted-foreground">
                <Hash className={META_BADGE_ICON_CLASS} />
                ID {exam.id}
              </MetaBadge>
            </div>
          </div>
        </div>
        <Separator className="mt-6 opacity-50" />
      </div>
    </>
  );
}
