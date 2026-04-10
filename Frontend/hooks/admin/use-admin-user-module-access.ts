import { useEffect, useMemo, useState } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import {
	getAdminUserModuleAccess,
	grantUserModuleAccess,
	revokeUserModuleAccess,
} from '@/lib/api/subscriptions';
import type {
	AdminUserModuleAccessPage,
	AdminUserModuleAccessRecord,
	GrantUserModuleAccessResult,
	ListAdminUserModuleAccessParams,
} from '@/lib/types/subscriptions';

const DEFAULT_LIMIT = 20;

const EMPTY_PAGE: AdminUserModuleAccessPage = {
	data: [],
	total: 0,
	page: 1,
	limit: DEFAULT_LIMIT,
	totalPages: 1,
};

export function useAdminUserModuleAccess(
	userId: number,
	initialData?: AdminUserModuleAccessPage | null,
) {
	const authFetch = useApiFetch();
	const [pageData, setPageData] = useState<AdminUserModuleAccessPage>(initialData ?? EMPTY_PAGE);
	const [loading, setLoading] = useState(!initialData);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<ListAdminUserModuleAccessParams>({
		includeRevoked: false,
		page: 1,
		limit: DEFAULT_LIMIT,
	});
	const [skipInitialFetch, setSkipInitialFetch] = useState(Boolean(initialData));

	useEffect(() => {
		if (skipInitialFetch) {
			setSkipInitialFetch(false);
			return;
		}

		let canceled = false;

		const run = async () => {
			try {
				setLoading(true);
				setError(null);
				const next = await getAdminUserModuleAccess(userId, filters, authFetch);
				if (canceled) return;
				setPageData(next);
			} catch (err) {
				if (canceled) return;
				setError(err instanceof Error ? err.message : 'Failed to load user access records.');
			} finally {
				if (!canceled) {
					setLoading(false);
				}
			}
		};

		run();
		return () => {
			canceled = true;
		};
	}, [authFetch, filters, skipInitialFetch, userId]);

	const activeAccessMap = useMemo(() => {
		const map = new Map<number, AdminUserModuleAccessRecord>();
		for (const record of pageData.data) {
			if (!record.revokedAt) {
				map.set(record.moduleId, record);
			}
		}
		return map;
	}, [pageData.data]);

	const updateFilters = (next: Partial<ListAdminUserModuleAccessParams>) => {
		setFilters((prev) => ({
			...prev,
			...next,
		}));
	};

	const refresh = async () => {
		setFilters((prev) => ({ ...prev }));
	};

	const grant = async (moduleId: number, source?: string): Promise<GrantUserModuleAccessResult> => {
		const result = await grantUserModuleAccess(
			{ userId, moduleId, source },
			authFetch,
		);
		await refresh();
		return result;
	};

	const revoke = async (moduleId: number) => {
		await revokeUserModuleAccess(userId, moduleId, authFetch);
		await refresh();
	};

	return {
		data: pageData,
		loading,
		error,
		filters,
		activeAccessMap,
		setPage: (page: number) => updateFilters({ page }),
		setIncludeRevoked: (includeRevoked: boolean) => updateFilters({ includeRevoked, page: 1 }),
		grant,
		revoke,
		refresh,
	};
}
