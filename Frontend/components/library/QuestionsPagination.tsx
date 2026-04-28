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
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function QuestionsPagination({
  currentPage,
  totalPages,
  limit,
  total,
  onPageChange,
  onLimitChange,
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

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      router.push(buildHref(page));
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
    } else {
      router.push(buildHref(1, newLimit));
    }
  };

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
    // <div className="@container/x flex flex-col @sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t">
    <div className="@container/x">

    <div className="flex flex-col @lg/x:flex-row @lg/x:justify-between @lg/x:items-center gap-4 pt-4 border-t">
      <div className="flex justify-between items-center w-full @lg/x:w-auto gap-4">
        {/* Count label */}
        <p className="text-muted-foreground text-xs">
          Showing {from}–{to} of {total} question{total !== 1 ? "s" : ""}
        </p>

        {/* Per-page selector (Mobile only) */}
        <div className="flex @lg/x:hidden items-center gap-1.5 text-muted-foreground text-xs">
          <span>Per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs px-2">
                {limit}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-22.5">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onSelect={() => handleLimitChange(size)}
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
      </div>

      <div className="flex items-center justify-center @lg/x:justify-end gap-3 w-full @lg/x:w-auto">
        {/* Per-page selector (Desktop only) */}
        <div className="hidden @lg/x:flex items-center gap-1.5 text-muted-foreground text-xs">
          <span>Per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
                {limit}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-22.5">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onSelect={() => handleLimitChange(size)}
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
            <PaginationContent className="gap-0.5 @sm/x:gap-1">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  aria-disabled={currentPage === 1}
                  className={cn(
                    "h-8 w-8 @sm/x:h-9 @sm/x:w-auto @sm/x:px-4",
                    currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                  )}
                />
              </PaginationItem>

              {pageItems.map((page, i) =>
                page === null ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis className="h-8 w-8 @sm/x:h-9 @sm/x:w-9" />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="h-8 w-8 @sm/x:h-9 @sm/x:w-9 cursor-pointer text-xs @sm/x:text-sm"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  aria-disabled={currentPage === totalPages}
                  className={cn(
                    "h-8 w-8 @sm/x:h-9 @sm/x:w-auto @sm/x:px-4",
                    currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
    </div>

  );
}
