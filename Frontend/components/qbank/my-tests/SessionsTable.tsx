"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { TypeBadge, resolveTestType } from "./TypeBadge";
import { ScoreCell } from "./ScoreCell";
import type { SessionListItem } from "@/lib/types/quizzes";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function resolveTitle(item: SessionListItem): string {
  return item.quiz.title?.trim() || `Quiz #${item.quiz.id}`;
}

// ─── row actions ──────────────────────────────────────────────────────────────

interface RowActionsProps {
  item: SessionListItem;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function RowActions({ item, onDelete, isDeleting }: RowActionsProps) {
  const { status, id } = item;

  const reviewOrResume =
    status === "completed" ? (
      <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs" asChild>
        <Link href={`/qbank/session/${id}`}>Review</Link>
      </Button>
    ) : (
      <Button variant="link" size="sm" className="p-0 h-auto text-primary text-xs" asChild>
        <Link href={`/qbank/session/${id}`}>
          {status === "not_started" ? "Start" : "Resume"}
        </Link>
      </Button>
    );

  return (
    <div className="flex justify-end items-center gap-3">
      {reviewOrResume}
      {status !== "completed" && (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto text-destructive text-xs"
          disabled={isDeleting}
          onClick={() => onDelete(id)}
        >
          Delete
        </Button>
      )}
    </div>
  );
}

// ─── skeleton ────────────────────────────────────────────────────────────────

export function SessionsTableSkeleton() {
  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {["Test Name / ID", "Date", "Type", "Status", "Score", "Actions"].map(
              (h) => (
                <TableHead key={h}>{h}</TableHead>
              ),
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="mb-1 w-36 h-4" />
                <Skeleton className="w-20 h-3" />
              </TableCell>
              <TableCell><Skeleton className="w-24 h-4" /></TableCell>
              <TableCell><Skeleton className="w-16 h-5" /></TableCell>
              <TableCell><Skeleton className="rounded-full w-24 h-5" /></TableCell>
              <TableCell><Skeleton className="w-28 h-4" /></TableCell>
              <TableCell><Skeleton className="ml-auto w-16 h-4" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

interface SessionsTableProps {
  items: SessionListItem[];
  deletingId: number | null;
  onDelete: (id: number) => void;
  /** Pagination state */
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function SessionsTable({
  items,
  deletingId,
  onDelete,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: SessionsTableProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card p-12 border rounded-xl text-muted-foreground text-sm text-center">
        No test sessions found.
      </div>
    );
  }

  const startEntry = (page - 1) * limit + 1;
  const endEntry = Math.min(page * limit, total);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-45">Test Name / ID</TableHead>
              <TableHead className="min-w-27.5">Date</TableHead>
              <TableHead className="min-w-22.5">Type</TableHead>
              <TableHead className="min-w-32.5">Status</TableHead>
              <TableHead className="min-w-40">Score</TableHead>
              <TableHead className="min-w-32.5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {/* Name + ID */}
                <TableCell>
                  <p className="font-semibold text-sm">{resolveTitle(item)}</p>
                  <p className="text-muted-foreground text-xs">#{item.id}</p>
                </TableCell>

                {/* Date (prefer startedAt > createdAt) */}
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatDate(item.startedAt ?? item.createdAt)}
                </TableCell>

                {/* Type */}
                <TableCell>
                  <TypeBadge type={resolveTestType(item.quiz.oldExamId)} />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>

                {/* Score */}
                <TableCell>
                  <ScoreCell scorePct={item.scorePct} status={item.status} />
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <RowActions
                    item={item}
                    onDelete={onDelete}
                    isDeleting={deletingId === item.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination footer */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-muted/30 px-4 py-3 border-t text-muted-foreground text-xs">
        <span>
          Showing {startEntry}–{endEntry} of {total}
        </span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }}
                aria-disabled={page <= 1}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                  acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "…" ? (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }}
                aria-disabled={page >= totalPages}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
