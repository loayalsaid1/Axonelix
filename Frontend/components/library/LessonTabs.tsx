"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, AlertCircle, HelpCircle, Layers } from "lucide-react";
import type { JSONContent } from '@tiptap/core';
import { ContentRenderer } from "@/components/shared/content-renderer";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { LessonQuestionsContent } from "@/components/library/LessonQuestionsContent";
import { LessonFlashcardsTab } from "@/components/flashcards/LessonFlashcardsTab";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

interface LessonTabsProps {
  content: JSONContent | Record<string, unknown> | string | null;
  isLegacyFormat?: boolean;
}


export function LessonTabs({ content, isLegacyFormat }: LessonTabsProps) {
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
          <ContentRenderer
            content={content}
            isLegacyFormat={isLegacyFormat}
            className="rounded-xl"
            loadingClassName="rounded-xl w-full h-64"
          />
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

      {/* Flashcards tab */}
      <TabsContent value="flashcards">
        {Number.isFinite(lessonId) ? (
          <LessonFlashcardsTab lessonId={lessonId} />
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertCircle className="text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>Missing lesson ID</EmptyTitle>
              <EmptyDescription>Unable to load flashcards without a valid lesson ID.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </TabsContent>
    </Tabs>
  );
}
