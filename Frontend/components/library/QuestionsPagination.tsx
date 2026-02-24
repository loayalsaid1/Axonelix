"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

interface QuestionsPaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  total: number;
}

export function QuestionsPagination({
  currentPage,
  totalPages,
  limit,
  total,
}: QuestionsPaginationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function buildHref(page: number, newLimit?: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("limit", String(newLimit ?? limit));
    return `${pathname}?${params.toString()}`;
  }

  /** Produce the page numbers to show, with undefined gaps represented by null */
  function getPageItems(): (number | null)[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const items: (number | null)[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) items.push(null); // ellipsis
    for (let p = start; p <= end; p++) items.push(p);
    if (end < totalPages - 1) items.push(null); // ellipsis
    items.push(totalPages);
    return items;
  }

  const pageItems = getPageItems();
  const from = (currentPage - 1) * limit + 1;
  const to = Math.min(currentPage * limit, total);

  return (
    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 pt-4 border-t">
      {/* Count label */}
      <p className="text-muted-foreground text-xs">
        Showing {from}–{to} of {total} question{total !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-3">
        {/* Per-page selector */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
          <span>Per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                {limit}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[90px]">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onSelect={() => router.push(buildHref(1, size))}
                  className={cn(
                    "flex justify-between items-center",
                    limit === size && "bg-accent font-medium",
                  )}
                >
                  {size}
                  {limit === size && <CheckCircle2 className="ml-2 w-3 h-3" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => router.push(buildHref(Math.max(1, currentPage - 1)))}
                  aria-disabled={currentPage === 1}
                  className={cn(currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
                />
              </PaginationItem>

              {pageItems.map((page, i) =>
                page === null ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => router.push(buildHref(page))}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => router.push(buildHref(Math.min(totalPages, currentPage + 1)))}
                  aria-disabled={currentPage === totalPages}
                  className={cn(
                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
