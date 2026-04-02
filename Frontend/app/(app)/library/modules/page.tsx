import type { Metadata } from "next";
import { getModules } from "@/lib/api/materials";
import { getMyModules } from "@/lib/api/subscriptions";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyBreadcrumb } from "@/components/library/HierarchyBreadcrumb";
import { EntityCard } from "@/components/library/EntityCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { buildOwnedModuleIdSet, withModuleAccess } from "@/lib/utils/module-access";
import { mockProgress, mockQuestionCount } from "@/lib/utils/mock-stats";

export const metadata: Metadata = { title: "Modules" };

export default async function ModulesPage() {
  const opts = await serverAuthOpts();
  const [modules, ownedRows] = await Promise.all([
    getModules(opts),
    getMyModules(undefined, opts),
  ]);
  const ownedModuleIds = buildOwnedModuleIdSet(ownedRows);
  const modulesWithAccess = withModuleAccess(modules, ownedModuleIds);
  const ownedModules = modulesWithAccess.filter((module) => module.accessStatus !== "locked");
  const lockedModules = modulesWithAccess.filter((module) => module.accessStatus === "locked");

  return (
    <div className="p-6 space-y-6">
      <HierarchyBreadcrumb segments={[{ label: "Modules" }]} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">All Modules</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse all academic modules
        </p>
      </div>

      {modulesWithAccess.length === 0 ? (
        <p className="text-sm text-muted-foreground">No modules yet.</p>
      ) : (
        <div className="space-y-6">
          {ownedModules.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">My Modules</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ownedModules.map((module) => (
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
            </div>
          )}

          {lockedModules.length > 0 && (
            <Collapsible className="rounded-xl border">
              <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Locked Modules</span>
                <span className="text-xs text-muted-foreground">{lockedModules.length}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="border-t">
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {lockedModules.map((module) => (
                    <EntityCard
                      key={module.id}
                      href={`/library/modules/${module.id}`}
                      name={module.name}
                      description={module.description}
                      locked
                      meta={
                        module.subjects.length
                          ? `${module.subjects.length} subject${module.subjects.length !== 1 ? "s" : ""}`
                          : undefined
                      }
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      )}
    </div>
  );
}
