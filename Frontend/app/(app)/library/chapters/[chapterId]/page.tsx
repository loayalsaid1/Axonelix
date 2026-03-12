import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapter } from "@/lib/api/materials";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { HierarchyPageHeader } from "@/components/library/HierarchyPageHeader";
import { LessonCard } from "@/components/library/LessonCard";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";

interface Props {
  params: Promise<{ chapterId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterId } = await params;
  try {
    const opts = await serverAuthOpts();
    const chapter = await getChapter(Number(chapterId), opts);
    return { title: chapter.name };
  } catch {
    return { title: "Chapter" };
  }
}

export default async function ChapterPage({ params }: Props) {
  const { chapterId } = await params;
  const id = Number(chapterId);
  const opts = await serverAuthOpts();

  let chapter;
  try {
    chapter = await getChapter(id, opts);
  } catch {
    notFound();
  }

  const subject = chapter.subject;
  const module = subject.module;

  return (
    <div className="space-y-6 p-6">
      <HierarchyBreadcrumb
        segments={[
          { label: "Modules", href: "/library/modules" },
          { label: module.name, href: `/library/modules/${module.id}` },
          { label: subject.name, href: `/library/subjects/${subject.id}` },
          { label: chapter.name },
        ]}
      />

      <HierarchyPageHeader
        name={chapter.name}
        description={chapter.description}
        questionCount={mockQuestionCount(chapter.id)}
        progress={mockProgress(chapter.id)}
      />

      {chapter.lessons.length === 0 ? (
        <p className="text-muted-foreground text-sm">No lessons yet.</p>
      ) : (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {chapter.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              subjectType={subject.type as "theoretical" | "practical"}
              progress={mockProgress(lesson.id)}
              questionCount={mockQuestionCount(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
