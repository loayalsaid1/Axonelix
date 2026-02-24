"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { X } from "lucide-react";
import type { ExamType, SubjectType } from "@/lib/types/old-exams";
import {
  EXAM_TYPES,
  SUBJECT_TYPES,
  EXAM_TYPE_LABELS,
  SUBJECT_TYPE_LABELS,
} from "@/lib/types/old-exams";
import type { ModuleName } from "@/lib/types/materials";

interface OldExamsFiltersProps {
  modules: ModuleName[];
  moduleId?: number;
  subjectType?: SubjectType;
  examType?: ExamType;
  onModuleChange: (id: number | undefined) => void;
  onSubjectTypeChange: (type: SubjectType | undefined) => void;
  onExamTypeChange: (type: ExamType | undefined) => void;
  onReset: () => void;
}

const ALL_VALUE = "__all__";

export function OldExamsFilters({
  modules,
  moduleId,
  subjectType,
  examType,
  onModuleChange,
  onSubjectTypeChange,
  onExamTypeChange,
  onReset,
}: OldExamsFiltersProps) {
  const hasActiveFilter = moduleId != null || subjectType != null || examType != null;

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* FieldGroup provides consistent vertical layout and spacing for each field */}
      <FieldGroup className="items-end gap-4 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] w-full">

        {/* Module */}
        <Field className="w-full min-w-0">
          <FieldLabel>Module</FieldLabel>
          <Select
            value={moduleId != null ? String(moduleId) : ALL_VALUE}
            onValueChange={(val) =>
              onModuleChange(val === ALL_VALUE ? undefined : Number(val))
            }
          >
            <SelectTrigger className="w-full min-w-0 h-9 text-sm truncate">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All modules</SelectItem>
              {modules.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Subject type (theoretical / practical subjects within the module) */}
        <Field className="w-full min-w-0">
          <FieldLabel>Subject Type</FieldLabel>
          <Select
            value={subjectType ?? ALL_VALUE}
            onValueChange={(val) =>
              onSubjectTypeChange(val === ALL_VALUE ? undefined : (val as SubjectType))
            }
          >
            <SelectTrigger className="w-full min-w-0 h-9 text-sm truncate">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All types</SelectItem>
              {SUBJECT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {SUBJECT_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Exam type */}
        <Field className="w-full min-w-0">
          <FieldLabel>Exam Type</FieldLabel>
          <Select
            value={examType ?? ALL_VALUE}
            onValueChange={(val) =>
              onExamTypeChange(val === ALL_VALUE ? undefined : (val as ExamType))
            }
          >
            <SelectTrigger className="w-full min-w-0 h-9 text-sm truncate">
              <SelectValue placeholder="All exam types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All exam types</SelectItem>
              {EXAM_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {EXAM_TYPE_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

      </FieldGroup>

      {/* Reset — sits outside FieldGroup so it aligns to the bottom of the row */}
      {hasActiveFilter && (
        <Button
          variant="outline"
          size="sm"
          className="self-end gap-1.5 ml-auto h-9 text-muted-foreground"
          onClick={onReset}
        >
          <X className="size-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
