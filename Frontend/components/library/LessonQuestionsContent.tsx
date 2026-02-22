"use client";

import { useEffect, useReducer } from "react";
import { useSearchParams } from "next/navigation";
import { getLessonQuestions } from "@/lib/api/questions";
import { QuestionCard } from "@/components/library/QuestionCard";
import { QuestionsPagination } from "@/components/library/QuestionsPagination";
import type { PaginatedQuestionsResponse } from "@/lib/types/questions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, AlertTriangle } from "lucide-react";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

interface LessonQuestionsContentProps {
  lessonId: number;
}

const VALID_LIMITS = [5, 10, 20, 50] as const;

// ── state machine ─────────────────────────────────────────────────────────────
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

/**
 * Client component — fetches questions lazily on first mount.
 * Radix Tabs only mounts tab content on first activation, so this fetch
 * is deferred until the user actually opens the Questions tab.
 * URL search params drive page / limit so pagination is shareable.
 */
export function LessonQuestionsContent({ lessonId }: LessonQuestionsContentProps) {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limitParam = Number(searchParams.get("limit"));
  const limit = (VALID_LIMITS as readonly number[]).includes(limitParam) ? limitParam : 10;

  const [state, dispatch] = useReducer(reducer, { status: "loading" });

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "FETCH" });
    getLessonQuestions(lessonId, page, limit)
      .then((result) => { if (!cancelled) dispatch({ type: "SUCCESS", result }); })
      .catch(() => { if (!cancelled) dispatch({ type: "ERROR" }); });
    return () => { cancelled = true; };
  }, [lessonId, page, limit]);

  if (state.status === "loading") {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="rounded-xl w-full h-36" />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlertTriangle className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Failed to load questions</EmptyTitle>
          <EmptyDescription>Unable to fetch questions at this moment. Please try again.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { result } = state;

  if (result.total === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HelpCircle className="text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>No questions yet</EmptyTitle>
          <EmptyDescription>This lesson doesn&apos;t have any attached questions.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const { data, total, totalPages } = result;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-base">Practice Questions</h3>
        <Badge variant="secondary" className="px-2 py-0.5 rounded-full text-xs">
          {total}
        </Badge>
      </div>

      <div className="gap-4 grid">
        {data.map((question, i) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={(page - 1) * limit + i + 1}
          />
        ))}
      </div>

      <QuestionsPagination
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        total={total}
      />
    </div>
  );
}
