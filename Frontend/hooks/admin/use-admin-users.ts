import { useState, useEffect, useCallback } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';
import type { AdminUserProfile, PaginatedResponse, Role } from '@/lib/types';

const DEFAULT_LIMIT = 20;

export function useAdminUsers(initialData?: PaginatedResponse<AdminUserProfile>) {
	const authFetch = useApiFetch();
	const [result, setResult] = useState<PaginatedResponse<AdminUserProfile>>(
		initialData ?? {
			data: [],
			total: 0,
			page: 1,
			limit: DEFAULT_LIMIT,
			totalPages: 1,
		},
	);
	const [loading, setLoading] = useState(!initialData);
	const [error, setError] = useState<Error | null>(null);
	const [page, setPage] = useState(1);
	const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
	const [sortCreatedAt, setSortCreatedAt] = useState<'asc' | 'desc'>('desc');
	// Track whether we need to re-fetch (skip on first render when initialData was provided)
	const [hasFetched, setHasFetched] = useState(!!initialData);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setDebouncedSearchTerm(searchTerm.trim());
		}, 350);
		return () => window.clearTimeout(timeoutId);
	}, [searchTerm]);

	useEffect(() => {
		// On first mount with initialData, skip the fetch — data is already loaded.
		// On any subsequent change (page / roleFilter), always re-fetch.
		if (!hasFetched) {
			setHasFetched(true);
			return;
		}

		const run = async () => {
			try {
				setLoading(true);
				setError(null);
				const qs = new URLSearchParams({ page: String(page), limit: String(DEFAULT_LIMIT) });
				if (roleFilter) qs.set('role', roleFilter);
				if (debouncedSearchTerm) qs.set('search', debouncedSearchTerm);
				qs.set('sortCreatedAt', sortCreatedAt);
				const data = await authFetch<PaginatedResponse<AdminUserProfile>>(
					`/admin/users?${qs}`,
					{ cache: 'no-store' } as RequestInit,
				);
				setResult(data);
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Failed to fetch users'));
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [page, roleFilter, debouncedSearchTerm, sortCreatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

	const deleteUser = useCallback(
		async (id: number) => {
			await authFetch<void>(`/admin/users/${id}`, { method: 'DELETE' });
			setResult((prev) => ({
				...prev,
				data: prev.data.filter((u) => u.id !== id),
				total: prev.total - 1,
			}));
		},
		[authFetch],
	);

	const bulkDelete = useCallback(
		async (ids: number[]) => {
			await authFetch<void>('/admin/users', {
				method: 'DELETE',
				body: { ids },
			});
			setResult((prev) => ({
				...prev,
				data: prev.data.filter((u) => !ids.includes(u.id)),
				total: prev.total - ids.length,
			}));
		},
		[authFetch],
	);

	return {
		users: result.data,
		total: result.total,
		page,
		totalPages: result.totalPages,
		limit: result.limit,
		loading,
		error,
		roleFilter,
		searchTerm,
		sortCreatedAt,
		setPage,
		setRoleFilter,
		setSearchTerm,
		setSortCreatedAt,
		deleteUser,
		bulkDelete,
	};
}
