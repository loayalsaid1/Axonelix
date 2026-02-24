import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Calendar } from "lucide-react";
import type { OldExam } from "@/lib/types/old-exams";
import { EXAM_TYPE_LABELS, SUBJECT_TYPE_LABELS } from "@/lib/types/old-exams";

interface ExamCardProps {
  exam: OldExam;
}

export function ExamCard({ exam }: ExamCardProps) {
  return (
    <Link href={`/qbank/old-exams/${exam.id}`} className="group block h-full">
      <Card className="hover:border-primary/50 h-full transition-colors">
        <CardHeader className="space-y-0 pb-2">
          <div className="flex justify-between items-start gap-3">
            <CardTitle className="font-semibold text-sm leading-snug">
              {exam.university.name}
            </CardTitle>
            <Badge variant="outline" className="font-mono shrink-0">
              {exam.year}
            </Badge>
          </div>
          <p className="flex items-center gap-1 pt-1 text-muted-foreground text-xs">
            <Building2 className="size-3" />
            {exam.module.name}
          </p>
        </CardHeader>

        <CardContent className="flex justify-between items-center pt-0">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs capitalize">
              {EXAM_TYPE_LABELS[exam.examType]}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {SUBJECT_TYPE_LABELS[exam.moduleType]}
            </Badge>
          </div>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
