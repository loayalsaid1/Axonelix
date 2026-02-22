import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLesson } from "@/lib/api/materials";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { HierarchyPageHeader } from "@/components/library/HierarchyPageHeader";
import { LessonTabs } from "@/components/library/LessonTabs";
import { LessonQuestionsContent } from "@/components/library/LessonQuestionsContent";
import { RecentLessonTracker } from "@/components/library/RecentLessonTracker";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";
import type { JSONContent } from "@tiptap/core";

interface Props {
  params: Promise<{ lessonId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  try {
    const lesson = await getLesson(Number(lessonId));
    return { title: lesson.name };
  } catch {
    return { title: "Lesson" };
  }
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const id = Number(lessonId);

  let lesson;
  try {
    lesson = await getLesson(id);
  } catch {
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
        questionCount={mockQuestionCount(lesson.id)}
        progress={mockProgress(lesson.id)}
      />

      <LessonTabs content={lesson.content as JSONContent | null} />
    </div>
  );
}
