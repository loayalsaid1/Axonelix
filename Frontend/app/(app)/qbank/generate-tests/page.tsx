import type { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/constants';
import type { ModuleHierarchy, ModuleWithSubjects } from '@/lib/types/materials';
import { GenerateTestPage } from '@/components/qbank/generate/GenerateTestPage';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { getMyModules } from '@/lib/api/subscriptions';
import { buildOwnedModuleIdSet, withHierarchyAccess } from '@/lib/utils/module-access';

export const metadata: Metadata = { title: 'Generate Test' };

/**
 * Server component: fetches the full hierarchy (modules → subjects → chapters → lessons)
 * and passes it to the client-side generator form.
 *
 * Strategy:
 *  1. Fetch all modules (lightweight list) to get IDs.
 *  2. Fan out to GET /materials/modules/:id/hierarchy for each module in parallel.
 *
 * Uses ISR with a 60 s window — hierarchy is slow-changing.
 */
async function fetchHierarchy(): Promise<ModuleHierarchy[]> {
  const opts = await serverAuthOpts();

  // 1. Fetch module list (includes subjects for ordering/display)
  const modulesRes = await fetch(`${API_BASE_URL}/materials/modules`, {
    ...opts,
    next: { revalidate: 60 },
  });
  if (!modulesRes.ok) return [];
  const modules: ModuleWithSubjects[] = await modulesRes.json();

  if (!modules.length) return [];

  const ownedRows = await getMyModules(undefined, opts);
  const ownedModuleIds = buildOwnedModuleIdSet(ownedRows);

  // 2. Fetch full hierarchy (subjects → chapters → lessons) for each module in parallel
  const hierarchies = await Promise.all(
    modules.map(async (m) => {
      const res = await fetch(`${API_BASE_URL}/materials/modules/${m.id}/hierarchy`, {
        ...opts,
        next: { revalidate: 60 },
      });
      if (!res.ok) {
        // Fall back to the module with empty subjects if the hierarchy fetch fails
        return { ...m, subjects: (m.subjects ?? []).map((s) => ({ ...s, chapters: [] })) } as ModuleHierarchy;
      }
      return res.json() as Promise<ModuleHierarchy>;
    }),
  );

  return withHierarchyAccess(hierarchies, ownedModuleIds);
}

export default async function GenerateTestsPage() {
  const hierarchy = await fetchHierarchy();

  return (
    <div className="h-[calc(100vh-3rem)]">
      <GenerateTestPage hierarchy={hierarchy} />
    </div>
  );
}
