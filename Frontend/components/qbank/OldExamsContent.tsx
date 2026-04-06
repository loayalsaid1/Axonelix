"use client";

import { useEffect, useReducer } from "react";
import { useAuth } from "@clerk/nextjs";
import { getModuleNames } from "@/lib/api/materials";
import { getOldExams } from "@/lib/api/old-exams";
import { OldExamsFilters } from "@/components/shared/old-exams/old-exams-filters";
import { ExamCard } from "@/components/qbank/ExamCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { AlertTriangle, FileSearch } from "lucide-react";
import type { OldExam } from "@/lib/types/old-exams";
import type { ModuleName } from "@/lib/types/materials";
import { Separator } from "../ui/separator";
import { useOldExamUrlFilters } from "@/hooks/use-old-exam-url-filters";

// ── State machine ─────────────────────────────────────────────────────────────

type ExamsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; exams: OldExam[] };

type ExamsAction =
  | { type: "FETCH" }
  | { type: "SUCCESS"; exams: OldExam[] }
  | { type: "ERROR" };

function examsReducer(_: ExamsState, action: ExamsAction): ExamsState {
  switch (action.type) {
    case "FETCH": return { status: "loading" };
    case "SUCCESS": return { status: "success", exams: action.exams };
    case "ERROR": return { status: "error" };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OldExamsContent() {
  const { getToken } = useAuth();
  const {
    moduleId,
    subjectType,
    examType,
    setModuleId,
    setSubjectType,
    setExamType,
    resetFilters,
  } = useOldExamUrlFilters();

  const [modules, setModules] = useReducer(
    (_: ModuleName[], next: ModuleName[]) => next,
    [],
  );
  const [state, dispatch] = useReducer(examsReducer, { status: "idle" });

  // Fetch module names once for filter dropdown
  useEffect(() => {
    getToken().then((token) => {
      const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      getModuleNames(opts)
        .then(setModules)
        .catch(() => {
          /* non-critical – filters still work without names */
        });
    });
  }, [getToken]);

  // Fetch exams whenever filters change
  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "FETCH" });
    getToken().then((token) => {
      const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      getOldExams({ moduleId, subjectType, examType }, opts)
        .then((exams) => { if (!cancelled) dispatch({ type: "SUCCESS", exams }); })
        .catch(() => { if (!cancelled) dispatch({ type: "ERROR" }); });
    });
    return () => { cancelled = true; };
  }, [moduleId, subjectType, examType, getToken]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <OldExamsFilters
        modules={modules}
        moduleId={moduleId}
        subjectType={subjectType}
        examType={examType}
        onModuleChange={setModuleId}
        onSubjectTypeChange={setSubjectType}
        onExamTypeChange={setExamType}
        onReset={resetFilters}
      />

      <Separator decorative />
      {/* Results */}
      {state.status === "loading" && (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="rounded-xl h-28" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Failed to load exams</EmptyTitle>
            <EmptyDescription>
              Unable to fetch old exams at this moment. Please try again.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {state.status === "success" && state.exams.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileSearch className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No exams found</EmptyTitle>
            <EmptyDescription>
              Try adjusting the filters above to find available exams.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {state.status === "success" && state.exams.length > 0 && (
        <>
          <p className="text-muted-foreground text-xs">
            {state.exams.length} exam{state.exams.length !== 1 ? "s" : ""} found
          </p>
          <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {state.exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
