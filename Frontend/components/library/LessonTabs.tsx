"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertCircle, Zap, HelpCircle, Layers } from "lucide-react";
import type { JSONContent } from "@tiptap/core";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { LessonQuestionsContent } from "@/components/library/LessonQuestionsContent";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

// Lazy-load the heavy TipTap renderer to avoid its SCSS & styles on initial parse
const EditorPreview = lazy(
  () => import("@/components/editor-preview/EditorPreview")
);

interface LessonTabsProps {
  content: JSONContent | null;
}


export function LessonTabs({ content }: LessonTabsProps) {
  const params = useParams();
  const lessonIdParam = params?.lessonId;
  const lessonId = lessonIdParam ? Number(lessonIdParam) : NaN;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") ?? "content";

  function handleTabChange(newTab: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", newTab);
    // Reset pagination when switching away from questions tab
    if (newTab !== "questions") {
      p.delete("page");
      p.delete("limit");
    }
    router.push(`${pathname}?${p.toString()}`);
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No content yet</EmptyTitle>
              <EmptyDescription>This lesson doesn&apos;t have content yet.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </TabsContent>

      {/* Questions tab — client fetch using route params */}
      <TabsContent value="questions">
        {Number.isFinite(lessonId) ? (
          <LessonQuestionsContent lessonId={lessonId} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>Missing lesson ID</EmptyTitle>
              <EmptyDescription>Unable to load questions without a valid lesson ID.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </TabsContent>

      {/* Flashcards stub */}
      <TabsContent value="flashcards">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Zap className="text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>Flashcards coming soon</EmptyTitle>
            <EmptyDescription>This feature is under development.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </TabsContent>
    </Tabs>
  );
}
