import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubject } from "@/lib/api/materials";
import { getLessons } from "@/lib/api/materials";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { HierarchyPageHeader } from "@/components/library/HierarchyPageHeader";
import { LessonCard } from "@/components/library/LessonCard";
import { EntityCard } from "@/components/library/EntityCard";
import { Badge } from "@/components/ui/badge";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";
import type { Chapter, Lesson } from "@/lib/types/materials";

interface Props {
  params: Promise<{ subjectId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subjectId } = await params;
  try {
    const opts = await serverAuthOpts();
    const subject = await getSubject(Number(subjectId), opts);
    return { title: subject.name };
  } catch {
    return { title: "Subject" };
  }
}

// ─── Helper: fetch lessons for each chapter in parallel ──────────────────────

async function chaptersWithLessons(
  chapters: Chapter[],
  subjectType: "theoretical" | "practical",
  opts?: RequestInit,
): Promise<Array<Chapter & { lessons: Lesson[] }>> {
  const results = await Promise.all(
    chapters.map(async (chapter) => {
      const lessons = await getLessons(chapter.id, {
        next: { revalidate: 60 },
        ...opts,
      });
      return { ...chapter, lessons };
    })
  );
  return results;
}

// ─── Chapter section component ────────────────────────────────────────────────

function ChapterSection({
  chapter,
  subjectType,
}: {
  chapter: Chapter & { lessons: Lesson[] };
  subjectType: "theoretical" | "practical";
}) {
  return (
    <section className="space-y-3">
      {/* Chapter header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <h2 className="text-base font-semibold">{chapter.name}</h2>
        {chapter.isMiscellaneous && (
          <Badge variant="secondary">Misc</Badge>
        )}
        <Badge variant="secondary">
          {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Lesson cards grid */}
      {chapter.lessons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No lessons yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {chapter.lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              subjectType={subjectType}
            // progress={mockProgress(lesson.id)}
            // questionCount={mockQuestionCount(lesson.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubjectPage({ params }: Props) {
  const { subjectId } = await params;
  const id = Number(subjectId);
  const opts = await serverAuthOpts();

  let subject;
  try {
    subject = await getSubject(id, opts);
  } catch {
    notFound();
  }

  const sortedChapters = [...subject.chapters].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const chapters = await chaptersWithLessons(
    sortedChapters,
    subject.type as "theoretical" | "practical",
    opts,
  );

  // Separate misc chapter(s) to show last
  const normalChapters = chapters.filter((c) => !c.isMiscellaneous);
  const miscChapters = chapters.filter((c) => c.isMiscellaneous);
  const orderedChapters = [...normalChapters, ...miscChapters];

  return (
    <div className="p-6 space-y-6">
      <HierarchyBreadcrumb
        segments={[
          { label: "Modules", href: "/library/modules" },
          {
            label: subject.module.name,
            href: `/library/modules/${subject.module.id}`,
          },
          { label: subject.name },
        ]}
      />

      <HierarchyPageHeader
        name={subject.name}
        description={subject.description}
        badge={subject.type === "theoretical" ? "Theoretical" : "Practical"}
        badgeVariant={subject.type as "theoretical" | "practical"}
      // questionCount={mockQuestionCount(subject.id)}
      // progress={mockProgress(subject.id)}
      />

      {orderedChapters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No chapters yet.</p>
      ) : (
        <div className="space-y-8">
          {orderedChapters.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              subjectType={subject.type as "theoretical" | "practical"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
