'use client';

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useQuizGenerator } from '@/hooks/use-quiz-generator';
import { GeneratorHierarchyPanel } from './GeneratorHierarchyPanel';
import { GeneratorConfigPanel } from './GeneratorConfigPanel';
import type { ModuleHierarchy } from '@/lib/types/materials';

interface GenerateTestPageProps {
  hierarchy: ModuleHierarchy[];
}

/**
 * Client component that owns all generator state and wires up both panels.
 *
 * Rendered inside the generate-tests page (server component) which fetches
 * and passes the full module hierarchy.
 */
export function GenerateTestPage({ hierarchy }: GenerateTestPageProps) {
  const {
    state,
    dispatch,
    totalSelected,
    toggleModule,
    toggleSubject,
    toggleChapter,
    toggleLesson,
    toggleModuleExpand,
    toggleSubjectExpand,
    toggleChapterExpand,
    selectAll,
    clearAll,
    generate,
    getModuleCheckState,
    getSubjectCheckState,
    getChapterCheckState,
    getLessonCheckState,
  } = useQuizGenerator(hierarchy);

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[calc(100vh-3rem)]">
      {/* Left: hierarchy selector */}
      <ResizablePanel defaultSize="320px" minSize="240px" maxSize="480px">
        <GeneratorHierarchyPanel
          hierarchy={hierarchy}
          totalSelected={totalSelected}
          expandedModules={state.expandedModules}
          expandedSubjects={state.expandedSubjects}
          expandedChapters={state.expandedChapters}
          onToggleModule={toggleModule}
          onToggleSubject={toggleSubject}
          onToggleChapter={toggleChapter}
          onToggleLesson={toggleLesson}
          onToggleModuleExpand={toggleModuleExpand}
          onToggleSubjectExpand={toggleSubjectExpand}
          onToggleChapterExpand={toggleChapterExpand}
          onSelectAll={selectAll}
          onClearAll={clearAll}
          getModuleCheckState={getModuleCheckState}
          getSubjectCheckState={getSubjectCheckState}
          getChapterCheckState={getChapterCheckState}
          getLessonCheckState={getLessonCheckState}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right: config form */}
      <ResizablePanel minSize={50}>
        <GeneratorConfigPanel
          state={state}
          dispatch={dispatch}
          onGenerate={generate}
          totalSelected={totalSelected}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
