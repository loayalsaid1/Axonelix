import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModuleHierarchy } from "@/lib/api/materials";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { HierarchyPageHeader } from "@/components/library/HierarchyPageHeader";
import { EntityCard } from "@/components/library/EntityCard";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";

interface Props {
  params: Promise<{ moduleId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { moduleId } = await params;
  try {
    const opts = await serverAuthOpts();
    const mod = await getModuleHierarchy(Number(moduleId), opts);
    return { title: mod.name };
  } catch {
    return { title: "Module" };
  }
}

export default async function ModulePage({ params }: Props) {
  const { moduleId } = await params;
  const id = Number(moduleId);
  const opts = await serverAuthOpts();

  let mod;
  try {
    mod = await getModuleHierarchy(id, opts);
  } catch {
    notFound();
  }

  // Split subjects by type for display
  const theoretical = mod.subjects.filter((s) => s.type === "theoretical");
  const practical = mod.subjects.filter((s) => s.type === "practical");

  return (
    <div className="space-y-6 p-6">
      <HierarchyBreadcrumb
        segments={[
          { label: "Modules", href: "/library/modules" },
          { label: mod.name },
        ]}
      />

      <HierarchyPageHeader
        name={mod.name}
        description={mod.description}
        questionCount={mockQuestionCount(mod.id)}
        progress={mockProgress(mod.id)}
      />

      {mod.subjects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No subjects yet.</p>
      ) : (
        <div className="space-y-8">
          {theoretical.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3 pb-2 border-border border-b">
                <h2 className="font-semibold text-base">Theoretical</h2>
                <span className="bg-muted px-2 py-0.5 rounded-full text-muted-foreground text-xs">
                  {theoretical.length}
                </span>
              </div>
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {theoretical.map((subject) => (
                  <EntityCard
                    key={subject.id}
                    href={`/library/subjects/${subject.id}`}
                    name={subject.name}
                    description={subject.description}
                    badge="Theoretical"
                    badgeVariant="theoretical"
                    meta={
                      subject.chapters?.length
                        ? `${subject.chapters.length} chapter${subject.chapters.length !== 1 ? "s" : ""}`
                        : undefined
                    }
                    progress={mockProgress(subject.id)}
                    footerLabel={`${mockQuestionCount(subject.id)} questions`}
                  />
                ))}
              </div>
            </section>
          )}

          {practical.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-3 pb-2 border-border border-b">
                <h2 className="font-semibold text-base">Practical</h2>
                <span className="bg-muted px-2 py-0.5 rounded-full text-muted-foreground text-xs">
                  {practical.length}
                </span>
              </div>
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {practical.map((subject) => (
                  <EntityCard
                    key={subject.id}
                    href={`/library/subjects/${subject.id}`}
                    name={subject.name}
                    description={subject.description}
                    badge="Practical"
                    badgeVariant="practical"
                    meta={
                      subject.chapters?.length
                        ? `${subject.chapters.length} chapter${subject.chapters.length !== 1 ? "s" : ""}`
                        : undefined
                    }
                    progress={mockProgress(subject.id)}
                    footerLabel={`${mockQuestionCount(subject.id)} questions`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
