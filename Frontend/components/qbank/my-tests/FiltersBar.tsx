"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { SessionStatus } from "@/lib/types/quizzes";
import type { TestType } from "./TypeBadge";

export interface FilterState {
  search: string;
  status: SessionStatus | "all";
  type: TestType | "all";
}

interface FiltersBarProps {
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
}

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="flex sm:flex-row flex-col sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="top-1/2 left-3 absolute size-4 text-muted-foreground -translate-y-1/2" />
        <Input
          className="pl-9"
          placeholder="Search by test name..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      {/* Type filter */}
      <Select
        value={filters.type}
        onValueChange={(v) => onChange({ type: v as TestType | "all" })}
      >
        <SelectTrigger className="w-full sm:w-37.5">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="qbank">QBank</SelectItem>
          <SelectItem value="old_exam">Old Exam</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ status: v as SessionStatus | "all" })}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="not_started">Not Started</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
