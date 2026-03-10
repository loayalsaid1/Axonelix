"use client";

import { useEffect, useReducer } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { getOldExamQuestions } from "@/lib/api/old-exams";
import { QuestionCard } from "@/components/library/QuestionCard";
import { QuestionsPagination } from "@/components/library/QuestionsPagination";
import type { PaginatedQuestionsResponse } from "@/lib/types/questions";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { AlertTriangle, FileSearch } from "lucide-react";

interface OldExamQuestionsContentProps {
  examId: number;
}

const VALID_LIMITS = [5, 10, 20, 50] as const;

// ── State machine ─────────────────────────────────────────────────────────────

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; result: PaginatedQuestionsResponse };

type Action =
  | { type: "FETCH" }
  | { type: "SUCCESS"; result: PaginatedQuestionsResponse }
  | { type: "ERROR" };

function reducer(_: State, action: Action): State {
  switch (action.type) {
    case "FETCH":   return { status: "loading" };
    case "SUCCESS": return { status: "success", result: action.result };
    case "ERROR":   return { status: "error" };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OldExamQuestionsContent({ examId }: OldExamQuestionsContentProps) {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limitParam = Number(searchParams.get("limit"));
  const limit = (VALID_LIMITS as readonly number[]).includes(limitParam) ? limitParam : 10;

  const [state, dispatch] = useReducer(reducer, { status: "loading" });
  const { getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "FETCH" });
    getToken().then((token) => {
      const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      getOldExamQuestions(examId, page, limit, opts)
        .then((result) => { if (!cancelled) dispatch({ type: "SUCCESS", result }); })
        .catch(() => { if (!cancelled) dispatch({ type: "ERROR" }); });
    });
    return () => { cancelled = true; };
  }, [examId, page, limit, getToken]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (state.status === "loading") {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="rounded-xl w-full h-36" />
        ))}
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (state.status === "error") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Failed to load questions</EmptyTitle>
          <EmptyDescription>
            Unable to fetch questions at this moment. Please try again.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { data: questions, total, totalPages } = state.result;

  // ── Empty ──────────────────────────────────────────────────────────────────

  if (questions.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileSearch className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No questions yet</EmptyTitle>
          <EmptyDescription>
            This exam has no questions attached yet.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────

  const globalOffset = (page - 1) * limit;

  return (
    <div className="flex flex-col gap-6">
      {/* Question list */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <QuestionCard key={q.id} question={q} index={globalOffset + idx + 1} />
        ))}
      </div>

      {/* Sticky pagination bar */}
      <div className="bottom-0 sticky bg-background/90 backdrop-blur -mx-6 px-6 py-3 border-t">
        <QuestionsPagination
          currentPage={page}
          totalPages={totalPages}
          limit={limit}
          total={total}
        />
      </div>
    </div>
  );
}
