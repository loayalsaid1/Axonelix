import type { Metadata } from "next";
import { getModules } from "@/lib/api/materials";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { EntityCard } from "@/components/library/EntityCard";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";

export const metadata: Metadata = { title: "Modules" };

export default async function ModulesPage() {
  const opts = await serverAuthOpts();
  const modules = await getModules(opts);

  return (
    <div className="p-6 space-y-6">
      <HierarchyBreadcrumb segments={[{ label: "Modules" }]} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Modules</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse all academic modules
        </p>
      </div>

      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No modules yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((module) => (
            <EntityCard
              key={module.id}
              href={`/library/modules/${module.id}`}
              name={module.name}
              description={module.description}
              meta={
                module.subjects.length
                  ? `${module.subjects.length} subject${module.subjects.length !== 1 ? "s" : ""}`
                  : undefined
              }
            // progress={mockProgress(module.id)}
            // footerLabel={`${mockQuestionCount(module.id)} questions`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
