"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getSessions, getSessionStats, deleteSession } from "@/lib/api/quizzes";
import { StatsRow, StatsRowSkeleton } from "./StatsRow";
import { FiltersBar, type FilterState } from "./FiltersBar";
import { SessionsTable, SessionsTableSkeleton } from "./SessionsTable";
import { resolveTestType } from "./TypeBadge";
import type {
  SessionListItem,
  UserTestStats,
  SessionStatus,
  PaginatedSessionsResponse,
} from "@/lib/types/quizzes";

// ─── State machine ────────────────────────────────────────────────────────────

type StatsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; data: UserTestStats };

type StatsAction =
  | { type: "LOADING" }
  | { type: "SUCCESS"; data: UserTestStats }
  | { type: "ERROR" };

function statsReducer(_: StatsState, action: StatsAction): StatsState {
  switch (action.type) {
    case "LOADING": return { status: "loading" };
    case "SUCCESS": return { status: "success", data: action.data };
    case "ERROR":   return { status: "error" };
  }
}

type SessionsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; response: PaginatedSessionsResponse };

type SessionsAction =
  | { type: "LOADING" }
  | { type: "SUCCESS"; response: PaginatedSessionsResponse }
  | { type: "ERROR" };

function sessionsReducer(_: SessionsState, action: SessionsAction): SessionsState {
  switch (action.type) {
    case "LOADING": return { status: "loading" };
    case "SUCCESS": return { status: "success", response: action.response };
    case "ERROR":   return { status: "error" };
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

// ─── Component ────────────────────────────────────────────────────────────────

export function MyTestsContent() {
  const { getToken } = useAuth();
  const router = useRouter();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [statsState, dispatchStats] = useReducer(statsReducer, { status: "loading" });
  const [sessionsState, dispatchSessions] = useReducer(sessionsReducer, { status: "loading" });

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>({ search: "", status: "all", type: "all" });
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // ─── Fetch stats ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    dispatchStats({ type: "LOADING" });
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getSessionStats(token);
      dispatchStats({ type: "SUCCESS", data });
    } catch {
      dispatchStats({ type: "ERROR" });
    }
  }, [getToken]);

  // ─── Fetch sessions ─────────────────────────────────────────────────────────
  // Use a ref to track the latest fetch so stale responses are discarded.
  const fetchAbortRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const fetchSessions = useCallback(
    async (currentPage: number, statusFilter: SessionStatus | "all") => {
      // Cancel any in-flight stale fetch
      fetchAbortRef.current.cancelled = true;
      const guard = { cancelled: false };
      fetchAbortRef.current = guard;

      dispatchSessions({ type: "LOADING" });
      try {
        const token = await getToken();
        if (!token || guard.cancelled) return;
        const response = await getSessions(
          token,
          currentPage,
          PAGE_SIZE,
          statusFilter === "all" ? undefined : statusFilter,
        );
        if (guard.cancelled) return;
        dispatchSessions({ type: "SUCCESS", response });
      } catch {
        if (!guard.cancelled) dispatchSessions({ type: "ERROR" });
      }
    },
    [getToken],
  );

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchSessions(1, "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when status filter or page changes
  useEffect(() => {
    fetchSessions(page, filters.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.status]);

  // Reset page to 1 when status changes (avoid empty pages)
  const handleFilterChange = useCallback((next: Partial<FilterState>) => {
    if (next.status !== undefined && next.status !== filters.status) {
      setPage(1);
    }
    setFilters((prev) => ({ ...prev, ...next }));
  }, [filters.status]);

  // ─── Delete ─────────────────────────────────────────────────────────────────
  // Step 1: user clicks Delete → open confirmation dialog
  const handleDelete = useCallback((id: number) => {
    setPendingDeleteId(id);
  }, []);

  // Step 2: user confirms → perform the actual API call
  const handleConfirmDelete = useCallback(
    async () => {
      if (pendingDeleteId === null) return;
      const id = pendingDeleteId;
      setPendingDeleteId(null);
      setDeletingId(id);
      try {
        const token = await getToken();
        if (!token) return;
        await deleteSession(id, token);
        toast.success("Session deleted.");
        await Promise.all([fetchStats(), fetchSessions(page, filters.status)]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete session.");
      } finally {
        setDeletingId(null);
      }
    },
    [pendingDeleteId, getToken, fetchStats, fetchSessions, page, filters.status],
  );

  // ─── Client-side filtering (search + type) ──────────────────────────────────
  const visibleItems = useMemo<SessionListItem[]>(() => {
    if (sessionsState.status !== "success") return [];

    let items = sessionsState.response.data as SessionListItem[];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.quiz.title?.toLowerCase().includes(q) ||
          String(s.id).includes(q) ||
          String(s.quiz.id).includes(q),
      );
    }

    if (filters.type !== "all") {
      items = items.filter(
        (s) => resolveTestType(s.quiz.oldExamId) === filters.type,
      );
    }

    return items;
  }, [sessionsState, filters.search, filters.type]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
    <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete test session?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The session and all its answers will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            onClick={handleConfirmDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <div className="space-y-6">
      {/* Stats row */}
      {statsState.status === "loading" ? (
        <StatsRowSkeleton />
      ) : statsState.status === "success" ? (
        <StatsRow stats={statsState.data} />
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load stats</AlertTitle>
          <AlertDescription>There was a problem fetching your statistics. Please try refreshing.</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <FiltersBar filters={filters} onChange={handleFilterChange} />

      {/* Table */}
      {sessionsState.status === "loading" ? (
        <SessionsTableSkeleton />
      ) : sessionsState.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load sessions</AlertTitle>
          <AlertDescription>There was a problem fetching your test sessions. Please try refreshing.</AlertDescription>
        </Alert>
      ) : (
        <SessionsTable
          items={visibleItems}
          deletingId={deletingId}
          onDelete={handleDelete}
          page={sessionsState.response.page}
          totalPages={sessionsState.response.totalPages}
          total={sessionsState.response.total}
          limit={PAGE_SIZE}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
    </>
  );
}
