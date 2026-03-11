import { apiFetch, type FetchOptions } from './client';
import type { AdminUserProfile, PaginatedResponse, Role } from '../types';

export interface AdminUsersParams {
	page?: number;
	limit?: number;
	role?: Role;
}

export function getAdminUsers(
	params: AdminUsersParams = {},
	opts?: FetchOptions,
): Promise<PaginatedResponse<AdminUserProfile>> {
	const qs = new URLSearchParams();
	if (params.page) qs.set('page', String(params.page));
	if (params.limit) qs.set('limit', String(params.limit));
	if (params.role) qs.set('role', params.role);
	return apiFetch<PaginatedResponse<AdminUserProfile>>(
		`/admin/users?${qs}`,
		{ cache: 'no-store', ...opts },
	);
}

export function deleteAdminUser(id: number, opts?: FetchOptions): Promise<void> {
	return apiFetch<void>(`/admin/users/${id}`, { method: 'DELETE', ...opts });
}

export function bulkDeleteAdminUsers(ids: number[], opts?: FetchOptions): Promise<void> {
	return apiFetch<void>('/admin/users', {
		method: 'DELETE',
		body: { ids },
		...opts,
	});
}
