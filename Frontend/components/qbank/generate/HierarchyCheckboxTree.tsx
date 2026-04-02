'use client';

import { useState } from 'react';
import { ChevronRight, Layers, BookOpen, BookMarked, FileText, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ModuleHierarchy } from '@/lib/types/materials';
import type { NodeCheckState } from '@/hooks/use-quiz-generator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Chapter = ModuleHierarchy['subjects'][number]['chapters'][number];
type Subject = ModuleHierarchy['subjects'][number];

// ─── Lesson row ───────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  chapterId,
  subjectId,
  moduleId,
  checkState,
  onToggle,
}: {
  lesson: Chapter['lessons'][number];
  chapterId: number;
  subjectId: number;
  moduleId: number;
  checkState: NodeCheckState;
  onToggle: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => void;
}) {
  return (
    <div
      role="row"
      className="group flex items-center gap-2 hover:bg-accent/50 px-2 py-1 rounded-md transition-colors cursor-pointer"
      onClick={() => onToggle(lesson.id, chapterId, subjectId, moduleId)}
    >
      <Checkbox
        checked={checkState === 'checked'}
        onCheckedChange={() => onToggle(lesson.id, chapterId, subjectId, moduleId)}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${lesson.name}`}
        className="shadow-none"
      />
      <FileText className="size-3 text-muted-foreground/40 shrink-0" />
      <span
        className={cn(
          'flex-1 text-[11px] truncate transition-colors',
          checkState === 'checked'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground/70 group-hover:text-foreground',
        )}
      >
        {lesson.name}
      </span>
    </div>
  );
}

// ─── Chapter row ──────────────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  subjectId,
  moduleId,
  checkState,
  expanded,
  onToggleCheck,
  onToggleExpand,
  onToggleLesson,
  getLessonCheckState,
}: {
  chapter: Chapter;
  subjectId: number;
  moduleId: number;
  checkState: NodeCheckState;
  expanded: boolean;
  onToggleCheck: (chapterId: number) => void;
  onToggleExpand: (chapterId: number) => void;
  onToggleLesson: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => void;
  getLessonCheckState: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => NodeCheckState;
}) {
  const hasLessons = chapter.lessons.length > 0;

  return (
    <Collapsible open={expanded} onOpenChange={() => hasLessons && onToggleExpand(chapter.id)}>
      <div className="group flex items-center gap-1 hover:bg-accent/50 py-1 pr-2 pl-1 rounded-md transition-colors">
        {/* Expand trigger */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={!hasLessons}
            className="flex justify-center items-center disabled:opacity-0 rounded w-4 h-4 text-muted-foreground/40 hover:text-foreground transition-colors shrink-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={cn('size-3 transition-transform', expanded && 'rotate-90')}
            />
          </button>
        </CollapsibleTrigger>

        <Checkbox
          checked={checkState === 'indeterminate' ? 'indeterminate' : checkState === 'checked'}
          onCheckedChange={() => onToggleCheck(chapter.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${chapter.name}`}
          className="shadow-none"
        />

        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={!hasLessons}
            className="flex flex-1 items-center gap-1.5 ml-0.5 min-w-0 text-left disabled:cursor-default"
          >
            <BookMarked className="size-3 text-muted-foreground/50 shrink-0" />
            <span
              className={cn(
                'flex-1 text-xs truncate transition-colors',
                checkState === 'checked'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            >
              {chapter.name}
            </span>
            {hasLessons && (
              <span className="ml-auto tabular-nums text-[10px] text-muted-foreground/40 shrink-0">
                {chapter.lessons.length} les
              </span>
            )}
          </button>
        </CollapsibleTrigger>
      </div>

      {hasLessons && (
        <CollapsibleContent className="space-y-0 ml-5 pl-2 border-border/40 border-l">
          {chapter.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              chapterId={chapter.id}
              subjectId={subjectId}
              moduleId={moduleId}
              checkState={getLessonCheckState(lesson.id, chapter.id, subjectId, moduleId)}
              onToggle={onToggleLesson}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

// ─── Subject row ──────────────────────────────────────────────────────────────

function SubjectRow({
  subject,
  moduleId,
  checkState,
  expanded,
  onToggleCheck,
  onToggleExpand,
  onToggleChapter,
  onToggleChapterExpand,
  onToggleLesson,
  getChapterCheckState,
  getLessonCheckState,
  expandedChapters,
}: {
  subject: Subject;
  moduleId: number;
  checkState: NodeCheckState;
  expanded: boolean;
  onToggleCheck: (subjectId: number, moduleId: number) => void;
  onToggleExpand: (subjectId: number) => void;
  onToggleChapter: (chapterId: number) => void;
  onToggleLesson: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => void;
  getChapterCheckState: (chapterId: number, subjectId: number, moduleId: number, allLessonIds: number[]) => NodeCheckState;
  getLessonCheckState: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => NodeCheckState;
  expandedChapters: ReadonlySet<number>;
  onToggleChapterExpand: (chapterId: number) => void;
}) {
  const hasChapters = subject.chapters.length > 0;

  return (
    <Collapsible open={expanded} onOpenChange={() => hasChapters && onToggleExpand(subject.id)}>
      <div className="group flex items-center gap-1 hover:bg-accent/50 py-1.5 pr-2 pl-1 rounded-md transition-colors">
        {/* Expand trigger */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={!hasChapters}
            className="flex justify-center items-center disabled:opacity-0 rounded w-4 h-4 text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={cn('size-3.5 transition-transform', expanded && 'rotate-90')}
            />
          </button>
        </CollapsibleTrigger>

        <Checkbox
          checked={checkState === 'indeterminate' ? 'indeterminate' : checkState === 'checked'}
          onCheckedChange={() => onToggleCheck(subject.id, moduleId)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${subject.name}`}
          className="shadow-none"
        />

        <CollapsibleTrigger asChild>
          <button
            type="button"
            disabled={!hasChapters}
            className="flex flex-1 items-center gap-1.5 ml-0.5 min-w-0 text-left disabled:cursor-default"
          >
            <Layers className="size-3.5 text-muted-foreground/60 shrink-0" />
            <span
              className={cn(
                'flex-1 text-xs truncate transition-colors',
                checkState === 'checked'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            >
              {subject.name}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'px-1.5 h-4 font-semibold text-[9px] uppercase shrink-0',
                subject.type === 'theoretical'
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
              )}
            >
              {subject.type === 'theoretical' ? 'TH' : 'PR'}
            </Badge>
          </button>
        </CollapsibleTrigger>
      </div>

      {hasChapters && (
        <CollapsibleContent className="space-y-0.5 ml-4 pl-2 border-border/50 border-l">
          {subject.chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              subjectId={subject.id}
              moduleId={moduleId}
              checkState={getChapterCheckState(
                chapter.id,
                subject.id,
                moduleId,
                chapter.lessons.map((l) => l.id),
              )}
              expanded={expandedChapters.has(chapter.id)}
              onToggleCheck={onToggleChapter}
              onToggleExpand={onToggleChapterExpand}
              onToggleLesson={onToggleLesson}
              getLessonCheckState={getLessonCheckState}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

// ─── Module row ───────────────────────────────────────────────────────────────

function ModuleRow({
  module,
  checkState,
  expanded,
  expandedSubjects,
  expandedChapters,
  onToggleCheck,
  onToggleExpand,
  onToggleSubject,
  onToggleSubjectExpand,
  onToggleChapter,
  onToggleChapterExpand,
  onToggleLesson,
  getSubjectCheckState,
  getChapterCheckState,
  getLessonCheckState,
}: {
  module: ModuleHierarchy;
  checkState: NodeCheckState;
  expanded: boolean;
  expandedSubjects: ReadonlySet<number>;
  expandedChapters: ReadonlySet<number>;
  onToggleCheck: (moduleId: number) => void;
  onToggleExpand: (moduleId: number) => void;
  onToggleSubject: (subjectId: number, moduleId: number) => void;
  onToggleSubjectExpand: (subjectId: number) => void;
  onToggleChapter: (chapterId: number) => void;
  onToggleChapterExpand: (chapterId: number) => void;
  onToggleLesson: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => void;
  getSubjectCheckState: (subjectId: number, moduleId: number) => NodeCheckState;
  getChapterCheckState: (chapterId: number, subjectId: number, moduleId: number, allLessonIds: number[]) => NodeCheckState;
  getLessonCheckState: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => NodeCheckState;
}) {
  const totalSubjects = module.subjects.length;
  const isLocked = module.accessStatus === 'locked';

  if (isLocked) {
    return (
      <div className="group flex items-center gap-1 bg-muted/40 py-1.5 pr-2 pl-1 border border-border rounded-md">
        <button
          type="button"
          disabled
          className="flex justify-center items-center rounded w-5 h-5 text-muted-foreground/30 shrink-0"
          aria-label="Locked module"
        >
          <ChevronRight className="size-3.5" />
        </button>

        <Checkbox checked={false} disabled aria-label={`Select ${module.name}`} className="shadow-none" />

        <div className="flex flex-1 items-center gap-1.5 ml-1 min-w-0">
          <Lock className="size-3.5 text-muted-foreground shrink-0" />
          <span className="flex-1 font-medium text-sm text-muted-foreground truncate">
            {module.name}
          </span>
          <Badge variant="secondary" className="px-1.5 h-4 font-semibold text-[9px] uppercase shrink-0">
            Locked
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={expanded} onOpenChange={() => onToggleExpand(module.id)}>
      {/* Module header */}
      <div className="group flex items-center gap-1 hover:bg-accent/50 py-1.5 pr-2 pl-1 rounded-md transition-colors">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex justify-center items-center rounded w-5 h-5 text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={cn('size-3.5 transition-transform', expanded && 'rotate-90')}
            />
          </button>
        </CollapsibleTrigger>

        <Checkbox
          checked={checkState === 'indeterminate' ? 'indeterminate' : checkState === 'checked'}
          onCheckedChange={() => onToggleCheck(module.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${module.name}`}
          className="shadow-none"
        />

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex flex-1 items-center gap-1.5 ml-1 min-w-0 text-left"
          >
            <BookOpen className="size-3.5 text-muted-foreground/60 shrink-0" />
            <span
              className={cn(
                'flex-1 font-medium text-sm truncate transition-colors',
                checkState === 'checked'
                  ? 'text-foreground'
                  : 'text-muted-foreground group-hover:text-foreground',
              )}
            >
              {module.name}
            </span>
            <span className="ml-auto tabular-nums text-[10px] text-muted-foreground/50 shrink-0">
              {totalSubjects} subj
            </span>
          </button>
        </CollapsibleTrigger>
      </div>

      {/* Subjects */}
      <CollapsibleContent className="space-y-0.5 ml-6 pl-2 border-border/50 border-l">
        {module.subjects.map((subject) => {
          const chapterStates = subject.chapters.map((chapter) =>
            getChapterCheckState(
              chapter.id,
              subject.id,
              module.id,
              chapter.lessons.map((l) => l.id),
            ),
          );

          let subjectState: NodeCheckState;
          if (chapterStates.length === 0) {
            subjectState = getSubjectCheckState(subject.id, module.id);
          } else if (chapterStates.every((s) => s === 'checked')) {
            subjectState = 'checked';
          } else if (chapterStates.some((s) => s === 'checked' || s === 'indeterminate')) {
            subjectState = 'indeterminate';
          } else {
            subjectState = getSubjectCheckState(subject.id, module.id);
          }

          return (
            <SubjectRow
              key={subject.id}
              subject={subject}
              moduleId={module.id}
              checkState={subjectState}
              expanded={expandedSubjects.has(subject.id)}
              onToggleCheck={onToggleSubject}
              onToggleExpand={onToggleSubjectExpand}
              onToggleChapter={onToggleChapter}
              onToggleChapterExpand={onToggleChapterExpand}
              onToggleLesson={onToggleLesson}
              getChapterCheckState={getChapterCheckState}
              getLessonCheckState={getLessonCheckState}
              expandedChapters={expandedChapters}
            />
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Exported tree component ──────────────────────────────────────────────────

interface HierarchyCheckboxTreeProps {
  hierarchy: ModuleHierarchy[];
  expandedModules: ReadonlySet<number>;
  expandedSubjects: ReadonlySet<number>;
  expandedChapters: ReadonlySet<number>;
  onToggleModule: (moduleId: number) => void;
  onToggleSubject: (subjectId: number, moduleId: number) => void;
  onToggleChapter: (chapterId: number) => void;
  onToggleLesson: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => void;
  onToggleModuleExpand: (moduleId: number) => void;
  onToggleSubjectExpand: (subjectId: number) => void;
  onToggleChapterExpand: (chapterId: number) => void;
  getModuleCheckState: (moduleId: number, allSubjectIds: number[]) => NodeCheckState;
  getSubjectCheckState: (subjectId: number, moduleId: number) => NodeCheckState;
  getChapterCheckState: (chapterId: number, subjectId: number, moduleId: number, allLessonIds: number[]) => NodeCheckState;
  getLessonCheckState: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => NodeCheckState;
}

export function HierarchyCheckboxTree({
  hierarchy,
  expandedModules,
  expandedSubjects,
  expandedChapters,
  onToggleModule,
  onToggleSubject,
  onToggleChapter,
  onToggleLesson,
  onToggleModuleExpand,
  onToggleSubjectExpand,
  onToggleChapterExpand,
  getModuleCheckState,
  getSubjectCheckState,
  getChapterCheckState,
  getLessonCheckState,
}: HierarchyCheckboxTreeProps) {
  const [lockedOpen, setLockedOpen] = useState(false);

  if (!hierarchy.length) {
    return (
      <div className="px-3 py-6 text-muted-foreground text-sm text-center">
        No materials found.
      </div>
    );
  }

  const unlockedHierarchy = hierarchy.filter((mod) => mod.accessStatus !== 'locked');
  const lockedHierarchy = hierarchy.filter((mod) => mod.accessStatus === 'locked');

  return (
    <div className="space-y-1 px-1">
      {unlockedHierarchy.map((mod) => {
        const allSubjectIds = mod.subjects.map((s) => s.id);
        return (
          <ModuleRow
            key={mod.id}
            module={mod}
            checkState={getModuleCheckState(mod.id, allSubjectIds)}
            expanded={expandedModules.has(mod.id)}
            expandedSubjects={expandedSubjects}
            expandedChapters={expandedChapters}
            onToggleCheck={onToggleModule}
            onToggleExpand={onToggleModuleExpand}
            onToggleSubject={onToggleSubject}
            onToggleSubjectExpand={onToggleSubjectExpand}
            onToggleChapter={onToggleChapter}
            onToggleChapterExpand={onToggleChapterExpand}
            onToggleLesson={onToggleLesson}
            getSubjectCheckState={getSubjectCheckState}
            getChapterCheckState={getChapterCheckState}
            getLessonCheckState={getLessonCheckState}
          />
        );
      })}

      {lockedHierarchy.length > 0 && (
        <div className="pt-1 border-border/70 border-t">
          <button
            type="button"
            onClick={() => setLockedOpen((open) => !open)}
            className="flex items-center gap-1.5 px-2 py-1 w-full font-semibold text-[10px] text-muted-foreground uppercase tracking-wider"
          >
            <ChevronRight className={cn('size-3 transition-transform', lockedOpen && 'rotate-90')} />
            <span>Locked Modules</span>
            <Badge variant="secondary" className="ml-auto text-[10px]">
              {lockedHierarchy.length}
            </Badge>
          </button>

          {lockedOpen && (
            <div className="space-y-0.5 mt-1">
              {lockedHierarchy.map((mod) => {
                const allSubjectIds = mod.subjects.map((s) => s.id);
                return (
                  <ModuleRow
                    key={mod.id}
                    module={mod}
                    checkState={getModuleCheckState(mod.id, allSubjectIds)}
                    expanded={expandedModules.has(mod.id)}
                    expandedSubjects={expandedSubjects}
                    expandedChapters={expandedChapters}
                    onToggleCheck={onToggleModule}
                    onToggleExpand={onToggleModuleExpand}
                    onToggleSubject={onToggleSubject}
                    onToggleSubjectExpand={onToggleSubjectExpand}
                    onToggleChapter={onToggleChapter}
                    onToggleChapterExpand={onToggleChapterExpand}
                    onToggleLesson={onToggleLesson}
                    getSubjectCheckState={getSubjectCheckState}
                    getChapterCheckState={getChapterCheckState}
                    getLessonCheckState={getLessonCheckState}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
