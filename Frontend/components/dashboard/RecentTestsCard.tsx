import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/qbank/my-tests/StatusBadge";
import { TypeBadge, resolveTestType } from "@/components/qbank/my-tests/TypeBadge";
import { ScoreCell } from "@/components/qbank/my-tests/ScoreCell";
import { getSessions } from "@/lib/api/quizzes";
import type { SessionListItem } from "@/lib/types/quizzes";
import { Separator } from "../ui/separator";

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

// ─── skeleton (for Suspense fallback) ─────────────────────────────────────────

export function RecentTestsCardSkeleton() {
  return (
    <Card className="gap-4 md:col-span-2 py-4">
      <CardHeader className="flex-row justify-between items-center space-y-0 px-5 pt-0 pb-0">
        <CardTitle className="text-sm">Recent Tests</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <Table>
          <TableHeader>
            <TableRow>
              {["Test Name / ID", "Date", "Type", "Status", "Score"].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="mb-1 w-36 h-3" />
                  <Skeleton className="w-16 h-2.5" />
                </TableCell>
                <TableCell><Skeleton className="w-20 h-3" /></TableCell>
                <TableCell><Skeleton className="w-14 h-5" /></TableCell>
                <TableCell><Skeleton className="rounded-full w-24 h-5" /></TableCell>
                <TableCell><Skeleton className="w-24 h-3" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── main async server component ──────────────────────────────────────────────

export async function RecentTestsCard() {
  const { getToken } = await auth();
  const token = await getToken();

  let sessions: SessionListItem[] = [];

  if (token) {
    try {
      const res = await getSessions(token, 1, 5);
      sessions = res.data as SessionListItem[];
    } catch {
      // Non-fatal — empty state shown below
    }
  }

  return (
    <Card className="gap-2 md:col-span-2 py-4">
      {/* <CardHeader className="flex-row justify-between items-center space-y-0 px-5 pt-0 pb-0"> */}
      <CardHeader>
        <CardTitle className="text-sm">Recent Tests</CardTitle>
        {/* <Button variant="ghost" size="sm" className="gap-1 px-2 h-7 text-xs" asChild>
          <Link href="/qbank/my-tests">
            View all <ArrowRight className="size-3" />
          </Link>
        </Button> */}
      </CardHeader>
      <CardContent className="p-0">
        {sessions.length === 0 ? (
          <div className="py-8 text-muted-foreground text-xs text-center">
            No tests yet.{" "}
            <Link
              href="/qbank/generate-tests"
              className="text-primary hover:underline underline-offset-2"
            >
              Generate your first test
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Test Name / ID</TableHead>
                  <TableHead className="min-w-[100px]">Date</TableHead>
                  <TableHead className="min-w-[80px]">Type</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="min-w-[140px]">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/qbank/session/${item.id}`}
                        className="group block"
                      >
                        <p className="font-semibold group-hover:text-primary text-sm transition-colors">
                          {resolveTitle(item)}
                        </p>
                        <p className="text-muted-foreground text-xs">#{item.id}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {formatDate(item.startedAt ?? item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <TypeBadge type={resolveTestType(item.quiz.oldExamId)} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <ScoreCell scorePct={item.scorePct} status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
