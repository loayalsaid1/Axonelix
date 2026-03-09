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
    <div className="space-y-4 p-4 rounded-lg border bg-muted/50" onKeyDown={handleKeyDown}>
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

      {/* Search */}
      <div className="space-y-2">
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

      {/* Subjects Multi-Select */}
      {moduleId && subjects.length > 0 && (
        <div className="space-y-2">
          <Label>Subjects (select one or more)</Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3 bg-background">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`subject-${subject.id}`}
                  checked={subjectIds.includes(subject.id)}
                  onCheckedChange={() => onSubjectToggle(subject.id)}
                />
                <Label
                  htmlFor={`subject-${subject.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {subject.name} ({subject.type})
                </Label>
              </div>
            ))}
          </div>
          
          {/* Selected subjects badges */}
          {subjectIds.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {subjectIds.map((id) => {
                const subject = subjects.find(s => s.id === id);
                if (!subject) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-secondary/80"
                    onClick={() => onSubjectToggle(id)}
                  >
                    {subject.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Chapters Multi-Select */}
      {subjectIds.length > 0 && chapters.length > 0 && (
        <div className="space-y-2">
          <Label>Chapters (select one or more)</Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3 bg-background">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`chapter-${chapter.id}`}
                  checked={chapterIds.includes(chapter.id)}
                  onCheckedChange={() => onChapterToggle(chapter.id)}
                />
                <Label
                  htmlFor={`chapter-${chapter.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {chapter.name}
                </Label>
              </div>
            ))}
          </div>
          
          {/* Selected chapters badges */}
          {chapterIds.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {chapterIds.map((id) => {
                const chapter = chapters.find(c => c.id === id);
                if (!chapter) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-secondary/80"
                    onClick={() => onChapterToggle(id)}
                  >
                    {chapter.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lesson Selection (Optional) */}
      {chapterIds.length > 0 && lessons.length > 0 && onLessonToggle && (
        <div className="space-y-2">
          <Label>Lessons (optional, select one or more)</Label>
          <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3 bg-background">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`lesson-${lesson.id}`}
                  checked={lessonIds.includes(lesson.id)}
                  onCheckedChange={() => onLessonToggle(lesson.id)}
                />
                <Label
                  htmlFor={`lesson-${lesson.id}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {lesson.name}
                </Label>
              </div>
            ))}
          </div>
          
          {/* Selected lessons badges */}
          {lessonIds.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {lessonIds.map((id) => {
                const lesson = lessons.find(l => l.id === id);
                if (!lesson) return null;
                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-secondary/80"
                    onClick={() => onLessonToggle(id)}
                  >
                    {lesson.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Miscellaneous checkbox (Optional) */}
      {onIsMiscChange && (
        <div className="flex items-center space-x-2 pt-2">
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

      {/* Apply Filters Button */}
      {showApplyButton && (
        <Button
          type="button"
          onClick={onApplyFilters}
          disabled={loading}
          className="w-full mt-4"
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </Button>
      )}
    </div>
  );
}
