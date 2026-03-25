'use client';

import { useState, useMemo } from 'react';
import { Search, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { HierarchyCheckboxTree } from './HierarchyCheckboxTree';
import type { ModuleHierarchy } from '@/lib/types/materials';
import type { NodeCheckState } from '@/hooks/use-quiz-generator';

interface GeneratorHierarchyPanelProps {
  hierarchy: ModuleHierarchy[];
  totalSelected: number;
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
  onSelectAll: () => void;
  onClearAll: () => void;
  getModuleCheckState: (moduleId: number, allSubjectIds: number[]) => NodeCheckState;
  getSubjectCheckState: (subjectId: number, moduleId: number) => NodeCheckState;
  getChapterCheckState: (chapterId: number, subjectId: number, moduleId: number, allLessonIds: number[]) => NodeCheckState;
  getLessonCheckState: (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => NodeCheckState;
}

export function GeneratorHierarchyPanel({
  hierarchy,
  totalSelected,
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
  onSelectAll,
  onClearAll,
  getModuleCheckState,
  getSubjectCheckState,
  getChapterCheckState,
  getLessonCheckState,
}: GeneratorHierarchyPanelProps) {
  const [search, setSearch] = useState('');

  // Filter hierarchy by search query
  const filtered = useMemo(() => {
    if (!search.trim()) return hierarchy;
    const q = search.toLowerCase();
    return hierarchy
      .map((mod) => ({
        ...mod,
        subjects: mod.subjects.filter(
          (s) => s.name.toLowerCase().includes(q) || mod.name.toLowerCase().includes(q),
        ),
      }))
      .filter((mod) => mod.name.toLowerCase().includes(q) || mod.subjects.length > 0);
  }, [hierarchy, search]);

  return (
    <aside className="flex flex-col bg-card border-border border-r h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <span className="font-semibold text-sm">Materials</span>
          {totalSelected > 0 && (
            <Badge className="justify-center px-1.5 min-w-5 h-5 font-bold text-[10px]">
              {totalSelected}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelectAll}
            className="px-2 h-7 text-primary hover:text-primary text-xs"
          >
            All
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="px-2 h-7 text-muted-foreground text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      <Separator />

      {/* Search */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="top-1/2 left-2.5 absolute size-3.5 text-muted-foreground/50 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules or subjects…"
            className="bg-muted/40 pl-8 border-transparent focus-visible:border-input h-8 text-xs"
          />
        </div>
      </div>

      <Separator />

      {/* Scrollable tree */}
      <ScrollArea className="flex-1 min-h-0 py-2">
        <HierarchyCheckboxTree
          hierarchy={filtered}
          expandedModules={expandedModules}
          expandedSubjects={expandedSubjects}
          expandedChapters={expandedChapters}
          onToggleModule={onToggleModule}
          onToggleSubject={onToggleSubject}
          onToggleChapter={onToggleChapter}
          onToggleLesson={onToggleLesson}
          onToggleModuleExpand={onToggleModuleExpand}
          onToggleSubjectExpand={onToggleSubjectExpand}
          onToggleChapterExpand={onToggleChapterExpand}
          getModuleCheckState={getModuleCheckState}
          getSubjectCheckState={getSubjectCheckState}
          getChapterCheckState={getChapterCheckState}
          getLessonCheckState={getLessonCheckState}
        />
      </ScrollArea>

      <Separator />

      {/* Footer: selected count hint */}
      <div className="px-4 py-2 text-muted-foreground text-xs shrink-0">
        {totalSelected > 0 ? (
          <span>
            <span className="font-medium text-foreground">{totalSelected}</span> item
            {totalSelected !== 1 ? 's' : ''} selected
          </span>
        ) : (
          <span className="text-muted-foreground/50">No scope selected — all questions will be used.</span>
        )}
      </div>
    </aside>
  );
}
