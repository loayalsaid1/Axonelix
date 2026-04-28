'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { Module, Subject, Chapter, Lesson } from '@/hooks/admin/use-question-filters';

interface QuestionFilterProps {
  // Filter values
  search: string;
  moduleId: string;
  subjectIds: string[];
  chapterIds: string[];
  lessonIds?: string[];
  isMisc?: boolean;
  questionType?: 'mcq' | 'written';
  sortOrder?: 'asc' | 'desc';
  
  // Available options
  modules: Module[];
  subjects: Subject[];
  chapters: Chapter[];
  lessons: Lesson[];
  
  // Loading states
  loading?: boolean;
  
  // Handlers
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onSubjectToggle: (subjectId: string) => void;
  onChapterToggle: (chapterId: string) => void;
  onLessonToggle?: (lessonId: string) => void;
  onIsMiscChange?: (value: boolean) => void;
  onQuestionTypeChange?: (value: 'mcq' | 'written' | undefined) => void;
  onSortOrderChange?: (value: 'asc' | 'desc') => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  
  // UI customization
  showApplyButton?: boolean;
  hasActiveFilters?: boolean;
}

export function QuestionFilter({
  search,
  moduleId,
  subjectIds = [],
  chapterIds = [],
  lessonIds = [],
  isMisc,
  questionType,
  sortOrder = 'desc',
  modules,
  subjects,
  chapters,
  lessons,
  loading = false,
  onSearchChange,
  onModuleChange,
  onSubjectToggle,
  onChapterToggle,
  onLessonToggle,
  onIsMiscChange,
  onQuestionTypeChange,
  onSortOrderChange,
  onApplyFilters,
  onClearFilters,
  showApplyButton = true,
  hasActiveFilters = false,
}: QuestionFilterProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      onApplyFilters();
    }
  };

  return (
    <div
      className="@container/question-filter space-y-6 rounded-lg border bg-muted/50 p-4"
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Filter Questions</h3>
        </div>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Top Filters Grid */}
      <div className="grid gap-4 @md/question-filter:grid-cols-2 @lg/question-filter:grid-cols-3">
        {/* Search */}
        <div className="space-y-2 @md/question-filter:col-span-2 @lg/question-filter:col-span-3">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by question text..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Module Selection */}
        <div className="space-y-2">
          <Label htmlFor="module">Module</Label>
          <Select value={moduleId} onValueChange={onModuleChange}>
            <SelectTrigger id="module">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Type */}
        {onQuestionTypeChange && (
          <div className="space-y-2">
            <Label htmlFor="question_type">Question Type</Label>
            <Select
              value={questionType ?? 'all'}
              onValueChange={(value) =>
                onQuestionTypeChange(value === 'all' ? undefined : (value as 'mcq' | 'written'))
              }
            >
              <SelectTrigger id="question_type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="mcq">Multiple choice</SelectItem>
                <SelectItem value="written">Written</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort Order */}
        {onSortOrderChange && (
          <div className="space-y-2">
            <Label htmlFor="sort_order">Sort By</Label>
            <Select
              value={sortOrder}
              onValueChange={(value) => onSortOrderChange(value as 'asc' | 'desc')}
            >
              <SelectTrigger id="sort_order">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest first</SelectItem>
                <SelectItem value="asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Cascading Multi-Selects Grid */}
      {moduleId && subjects.length > 0 && (
        <div className="grid gap-4 border-t pt-6 @md/question-filter:grid-cols-2 @lg/question-filter:grid-cols-3">
          <MultiSelectFilter
            label="Subjects"
            items={subjects.map((s) => ({ id: s.id, name: s.name, badge: s.type }))}
            selectedIds={subjectIds}
            onToggle={onSubjectToggle}
          />

          {subjectIds.length > 0 && chapters.length > 0 && (
            <MultiSelectFilter
              label="Chapters"
              items={chapters}
              selectedIds={chapterIds}
              onToggle={onChapterToggle}
            />
          )}

          {chapterIds.length > 0 && lessons.length > 0 && onLessonToggle && (
            <MultiSelectFilter
              label="Lessons (optional)"
              items={lessons}
              selectedIds={lessonIds}
              onToggle={onLessonToggle}
            />
          )}
        </div>
      )}

      {/* Bottom Actions Row */}
      <div className="flex flex-col justify-between gap-4 border-t pt-4 @md/question-filter:flex-row @md/question-filter:items-center">
        <div className="flex items-center">
          {onIsMiscChange && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_misc"
                checked={isMisc === true}
                onCheckedChange={(checked) => onIsMiscChange(!!checked)}
              />
              <Label htmlFor="is_misc" className="text-sm cursor-pointer">
                Show only miscellaneous questions
              </Label>
            </div>
          )}
        </div>

        {showApplyButton && (
          <Button
            type="button"
            onClick={onApplyFilters}
            disabled={loading}
            className="w-full @md/question-filter:w-auto"
          >
            {loading ? 'Loading...' : 'Apply Filters'}
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Helper Components ---

interface MultiSelectItem {
  id: string;
  name: string;
  badge?: string;
}

interface MultiSelectFilterProps {
  label: string;
  items: MultiSelectItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function MultiSelectFilter({ label, items, selectedIds, onToggle }: MultiSelectFilterProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2 max-h-52 overflow-y-auto border rounded-md p-3 bg-background">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-2 py-1">
            <Checkbox
              id={`item-${item.id}`}
              checked={selectedIds.includes(item.id)}
              onCheckedChange={() => onToggle(item.id)}
              className="mt-0.5 shrink-0"
            />
            <Label
              htmlFor={`item-${item.id}`}
              className="text-sm font-normal cursor-pointer flex-1 break-words leading-tight"
            >
              {item.name}
              {item.badge && (
                <span className="text-muted-foreground whitespace-nowrap ml-1">
                  ({item.badge})
                </span>
              )}
            </Label>
          </div>
        ))}
      </div>

      {/* Selected badges */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {selectedIds.map((id) => {
            const item = items.find((i) => i.id === id);
            if (!item) return null;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-secondary/80 flex items-center max-w-full"
                onClick={() => onToggle(id)}
                title={item.name} // Show full name on hover
              >
                <span className="truncate max-w-44 sm:max-w-50 inline-block align-bottom">{item.name}</span>
                <X className="h-3 w-3 ml-1 shrink-0" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
