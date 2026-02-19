"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, HelpCircle, Layers } from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-load the heavy TipTap renderer to avoid its SCSS & styles on initial parse
const EditorPreview = lazy(
  () => import("@/components/editor-preview/EditorPreview")
);

interface LessonTabsProps {
  content: JSONContent | null;
}

/**
 * Client component providing the tabbed interface for a lesson view.
 * Content tab: TipTap static renderer.
 * Questions / Flashcards tabs: stubs for future implementation.
 */
export function LessonTabs({ content }: LessonTabsProps) {
  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList variant="line" className="mb-4 border-border border-b">
        <TabsTrigger value="content" className="gap-1.5">
          <FileText className="size-3.5" />
          Content
        </TabsTrigger>
        <TabsTrigger value="questions" className="gap-1.5">
          <HelpCircle className="size-3.5" />
          Questions
        </TabsTrigger>
        <TabsTrigger value="flashcards" className="gap-1.5">
          <Layers className="size-3.5" />
          Flashcards
        </TabsTrigger>
      </TabsList>

      {/* Content tab */}
      <TabsContent value="content">
        {content ? (
          <Suspense fallback={<Skeleton className="rounded-xl w-full h-64" />}>
            <EditorPreview content={content} />
          </Suspense>
        ) : (
          <div className="flex justify-center items-center border border-border border-dashed rounded-xl min-h-48">
            <p className="text-muted-foreground text-sm">
              No content yet for this lesson.
            </p>
          </div>
        )}
      </TabsContent>

      {/* Questions stub */}
      <TabsContent value="questions">
        <div className="flex justify-center items-center border border-border border-dashed rounded-xl min-h-48">
          <p className="text-muted-foreground text-sm">
            Questions coming soon.
          </p>
        </div>
      </TabsContent>

      {/* Flashcards stub */}
      <TabsContent value="flashcards">
        <div className="flex justify-center items-center border border-border border-dashed rounded-xl min-h-48">
          <p className="text-muted-foreground text-sm">
            Flashcards coming soon.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
