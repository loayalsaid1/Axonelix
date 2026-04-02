import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson, getLessonPreview } from "@/lib/api/materials";
import { ApiError } from "@/lib/api/client";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { HierarchyPageHeader } from "@/components/library/HierarchyPageHeader";
import { LessonTabs } from "@/components/library/LessonTabs";
import { LessonQuestionsContent } from "@/components/library/LessonQuestionsContent";
import { RecentLessonTracker } from "@/components/library/RecentLessonTracker";
import { ModuleLockedPaywall } from "@/components/library/ModuleLockedPaywall";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";
import type { JSONContent } from "@tiptap/core";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const id = Number(lessonId);

  try {
    const opts = await serverAuthOpts();
    const lesson = await getLesson(id, opts);
    return { title: lesson.name };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      try {
        const opts = await serverAuthOpts();
        const preview = await getLessonPreview(id, opts);
        return { title: preview.name };
      } catch {
        return { title: "Locked Lesson" };
      }
    }

    return { title: "Lesson" };
  }
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const id = Number(lessonId);
  const opts = await serverAuthOpts();

  let lesson;
  let previewLesson;
  let showLockedPaywall = false;
  try {
    lesson = await getLesson(id, opts);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    if (error instanceof ApiError && error.status === 403) {
      try {
        previewLesson = await getLessonPreview(id, opts);
        showLockedPaywall = true;
      } catch {
        showLockedPaywall = true;
      }
    } else {
      throw error;
    }
  }

  if (showLockedPaywall) {
    if (!previewLesson) {
      return (
        <div className="space-y-6 p-6">
          <ModuleLockedPaywall
            lessonName="This lesson"
            moduleName="this module"
          />
        </div>
      );
    }

    const { chapter } = previewLesson;
    const { subject } = chapter;
    const { module } = subject;

    return (
      <div className="space-y-6 p-6">
        <HierarchyBreadcrumb
          segments={[
            { label: "Modules", href: "/library/modules" },
            { label: module.name, href: `/library/modules/${module.id}` },
            { label: subject.name, href: `/library/subjects/${subject.id}` },
            { label: chapter.name, href: `/library/chapters/${chapter.id}` },
            { label: previewLesson.name },
          ]}
        />

        <HierarchyPageHeader
          name={previewLesson.name}
          description={previewLesson.description}
          badge={subject.type === "theoretical" ? "Theoretical" : "Practical"}
          badgeVariant={subject.type as "theoretical" | "practical"}
        />

        <ModuleLockedPaywall
          lessonName={previewLesson.name}
          moduleName={module.name}
          subjectName={subject.name}
          chapterName={chapter.name}
        />
      </div>
    );
  }

  if (!lesson) {
    notFound();
  }

  const { chapter } = lesson;
  const { subject } = chapter;
  const { module } = subject;

  return (
    <div className="space-y-6 p-6">
      {/* Register visit in localStorage (client-side, invisible) */}
      <RecentLessonTracker lesson={lesson} />

      <HierarchyBreadcrumb
        segments={[
          { label: "Modules", href: "/library/modules" },
          { label: module.name, href: `/library/modules/${module.id}` },
          { label: subject.name, href: `/library/subjects/${subject.id}` },
          { label: chapter.name, href: `/library/chapters/${chapter.id}` },
          { label: lesson.name },
        ]}
      />

      <HierarchyPageHeader
        name={lesson.name}
        description={lesson.description}
        badge={subject.type === "theoretical" ? "Theoretical" : "Practical"}
        badgeVariant={subject.type as "theoretical" | "practical"}
      // questionCount={mockQuestionCount(lesson.id)}
      // progress={mockProgress(lesson.id)}
      />

      <LessonTabs content={lesson.content as JSONContent | null} />
    </div>
  );
}
