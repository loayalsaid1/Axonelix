import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOldExam } from "@/lib/api/old-exams";
import { OldExamQuestionsContent } from "@/components/qbank/OldExamQuestionsContent";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Building2, Calendar, BookOpen } from "lucide-react";
import {
  EXAM_TYPE_LABELS,
  SUBJECT_TYPE_LABELS,
} from "@/lib/types/old-exams";

interface Props {
  params: Promise<{ examId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { examId } = await params;
  try {
    const exam = await getOldExam(Number(examId));
    return {
      title: `${exam.university.name} ${exam.year} – ${EXAM_TYPE_LABELS[exam.examType]}`,
    };
  } catch {
    return { title: "Old Exam" };
  }
}

export default async function OldExamDetailPage({ params }: Props) {
  const { examId } = await params;
  const id = Number(examId);

  let exam;
  try {
    exam = await getOldExam(id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumbs */}
      <HierarchyBreadcrumb
        segments={[
          { label: "Old Exams", href: "/qbank/old-exams" },
          {
            label: `${exam.university.name} ${exam.year}`,
          },
        ]}
      />

      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="font-semibold text-xl tracking-tight">
            {exam.university.name} &ndash; {exam.year}
          </h1>

          {/* Meta badges row */}
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {exam.module.name}
            </span>
            <Badge variant="secondary">
              {EXAM_TYPE_LABELS[exam.examType]}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {SUBJECT_TYPE_LABELS[exam.moduleType]}
            </Badge>
          </div>
        </div>

        {/* Generate Quiz – coming soon */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>
              <Button variant="outline" size="sm" disabled className="gap-2">
                <Zap className="size-4" />
                Generate Quiz
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Coming soon</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <hr className="border-border" />

      {/* Questions */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="rounded-xl w-full h-36" />
            ))}
          </div>
        }
      >
        <OldExamQuestionsContent examId={id} />
      </Suspense>
    </div>
  );
}
