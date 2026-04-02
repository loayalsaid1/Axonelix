import type { ModuleHierarchy } from '@/lib/types/materials';
import type { MyModuleAccessRecord } from '@/lib/types/subscriptions';

type AccessStatus = 'owned' | 'locked';

export function buildOwnedModuleIdSet(accessRows: MyModuleAccessRecord[]): Set<number> {
	return new Set(accessRows.map((row) => row.moduleId));
}

export function withModuleAccess<T extends { id: number }>(
	modules: T[],
	ownedModuleIds: ReadonlySet<number>,
): Array<T & { accessStatus: AccessStatus }> {
	return modules.map((module) => ({
		...module,
		accessStatus: ownedModuleIds.has(module.id) ? 'owned' : 'locked',
	}));
}

export function withHierarchyAccess(
	hierarchy: ModuleHierarchy[],
	ownedModuleIds: ReadonlySet<number>,
): Array<ModuleHierarchy & { accessStatus: AccessStatus }> {
	return withModuleAccess(hierarchy, ownedModuleIds);
}
