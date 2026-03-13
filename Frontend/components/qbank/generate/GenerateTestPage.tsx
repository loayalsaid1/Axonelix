'use client';

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
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

  const isMobile = useIsMobile();

  const hierarchyPanel = (
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
  );

  const configPanel = (
    <GeneratorConfigPanel
      state={state}
      dispatch={dispatch}
      onGenerate={generate}
      totalSelected={totalSelected}
    />
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-[calc(100vh-3rem)]">
        <Tabs defaultValue="materials" className="flex-1 flex flex-col w-full data-[state=active]:flex-1">
          <div className="px-4 py-2 border-b">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="materials" className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              {hierarchyPanel}
            </div>
          </TabsContent>
          <TabsContent value="config" className="flex-1 p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              {configPanel}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-[calc(100vh-3rem)]">
      {/* Left: hierarchy selector */}
      <ResizablePanel defaultSize="320px" minSize="240px" maxSize="480px">
        {hierarchyPanel}
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right: config form */}
      <ResizablePanel minSize={50}>
        {configPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
