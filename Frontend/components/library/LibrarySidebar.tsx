import { Suspense } from "react";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { getModules } from "@/lib/api/materials";
import { HierarchyTreeClient } from "@/components/library/HierarchyTreeClient";
import { RecentLessonsPanel } from "@/components/library/RecentLessonsPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE_URL } from "@/lib/constants";


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
  const modules = await getModules();

  // For the sidebar tree we need chapters+lessons too; fetch hierarchies in parallel
  console.log("🔍 Starting hierarchy fetch for modules:", modules);
  console.log("📡 API Base URL:", API_BASE_URL);
  
  const hierarchies = await Promise.all(
    modules.map((m) => {
      const url = `${API_BASE_URL}/materials/modules/${m.id}/hierarchy`;
      console.log(`🌳 Fetching hierarchy for module ${m.id}:`, url);
      
      return fetch(url, { next: { revalidate: 60 } })
        .then((r) => {
          console.log(`✅ Response received for module ${m.id}:`, r.status, r.statusText);
          if (!r.ok) {
            console.error(`❌ Error response for module ${m.id}:`, r.status);
          }
          return r.json();
        })
        .catch((err) => {
          console.error(`❌ Fetch failed for module ${m.id}:`, err.message, err.code);
          throw err;
        });
    })
  );
  
  console.log("✨ All hierarchies fetched successfully:", hierarchies);

  return <HierarchyTreeClient modules={hierarchies} />;
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
          className="ml-auto text-sidebar-foreground/40 hover:text-sidebar-foreground/70 text-xs transition-colors"
        >
          All Modules
        </Link>
      </div>

      {/* Search (placeholder — non-functional placeholder per spec) */}
      <div className="p-3 border-sidebar-border border-b">
        <div className="flex items-center gap-2 bg-sidebar-accent/30 px-3 py-1.5 border border-sidebar-border rounded-md text-sidebar-foreground/50 text-sm">
          <Search className="size-3.5 shrink-0" />
          <span>Search lessons…</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex flex-col flex-1 gap-4 py-3 overflow-y-auto">
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
