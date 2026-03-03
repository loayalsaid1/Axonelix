import { cn } from "@/lib/utils";

export type TestType = "qbank" | "old_exam";

const TYPE_LABELS: Record<TestType, string> = {
  qbank: "QBank",
  old_exam: "Old Exam",
};

interface TypeBadgeProps {
  type: TestType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block bg-muted px-2 py-0.5 rounded font-bold text-[10px] text-muted-foreground uppercase tracking-wider",
        className,
      )}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

/** Derive the test type from the quiz's oldExamId field. */
export function resolveTestType(oldExamId: number | null | undefined): TestType {
  return oldExamId != null ? "old_exam" : "qbank";
}
