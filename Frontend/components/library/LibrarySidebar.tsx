import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { getModuleHierarchy, getModules } from "@/lib/api/materials";
import { getMyModules } from "@/lib/api/subscriptions";
import { serverAuthOpts } from "@/lib/api/server-auth-opts";
import { HierarchyTreeClient } from "@/components/library/HierarchyTreeClient";
import { RecentLessonsPanel } from "@/components/library/RecentLessonsPanel";
import { LessonSearchBox } from "@/components/library/LessonSearchBox";
import { NoOwnedModulesCta } from "@/components/subscriptions/NoOwnedModulesCta";
import { Skeleton } from "@/components/ui/skeleton";
import { buildOwnedModuleIdSet, withHierarchyAccess } from "@/lib/utils/module-access";


// ─── Tree skeleton shown while the server fetches module data ────────────────
function TreeSkeleton() {
  return (
    <div className="space-y-2 px-3 py-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="rounded-md h-7" />
      ))}
    </div>
  );
}

// ─── Server component: fetches full hierarchy for the tree ───────────────────

async function HierarchyTree() {
  // We fetch all module hierarchies to build the full nav tree.
  // Uses ISR (revalidate: 60) set in the API helper.
  const opts = await serverAuthOpts();
  const [modules, ownedRows] = await Promise.all([
    getModules(opts),
    getMyModules(undefined, opts),
  ]);

  // For the sidebar tree we need chapters+lessons too; fetch hierarchies in parallel
  const hierarchies = await Promise.all(
    modules.map((m) => getModuleHierarchy(m.id, opts))
  );

  const ownedModuleIds = buildOwnedModuleIdSet(ownedRows);
  const hierarchyWithAccess = withHierarchyAccess(hierarchies, ownedModuleIds);

  return (
    <>
      {modules.length > 0 && ownedModuleIds.size === 0 && (
        <div className="px-2 pb-2">
          <NoOwnedModulesCta compact />
        </div>
      )}
      <HierarchyTreeClient modules={hierarchyWithAccess} />
    </>
  );
}

// ─── Main exported sidebar ────────────────────────────────────────────────────

export function LibrarySidebar() {
  return (
    <aside className="flex flex-col bg-sidebar border-sidebar-border border-r w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 border-sidebar-border border-b h-14">
        <BookOpen className="size-4 text-sidebar-foreground/60" />
        <span className="font-semibold text-sm">Library</span>
        <Link
          href="/library"
          className="mr-6 md:mr-0 ml-auto text-sidebar-foreground/40 hover:text-sidebar-foreground/70 text-xs transition-colors"
        >
          All Modules
        </Link>
      </div>

      {/* Search (placeholder — non-functional placeholder per spec) */}
      <LessonSearchBox />

      {/* Scrollable body */}
      <div className="flex flex-col flex-1 min-h-0 gap-4 py-3 overflow-y-auto">
        {/* Recent lessons (client hydration) */}
        <RecentLessonsPanel />

        {/* Navigation tree */}
        <div>
          <p className="px-3 py-1 font-semibold text-[10px] text-sidebar-foreground/40 uppercase tracking-widest">
            Modules
          </p>
          <div className="px-2">
            <Suspense fallback={<TreeSkeleton />}>
              <HierarchyTree />
            </Suspense>
          </div>
        </div>
      </div>
    </aside>
  );
}
