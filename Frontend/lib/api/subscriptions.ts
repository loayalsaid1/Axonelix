import { apiFetch, type FetchOptions } from './client';
import type {
	AdminUserModuleAccessPage,
	CreatePaymentRequestDto,
	GlobalModuleAccessDto,
	GlobalModuleAccessMutationResult,
	GrantUserModuleAccessDto,
	GrantUserModuleAccessResult,
	ListAdminUserModuleAccessParams,
	ListAdminPaymentRequestsParams,
	ListMyPaymentRequestsParams,
	MyModuleAccessRecord,
	PaymentInfo,
	PaymentRequestPage,
	PaymentRequestRecord,
	PaymentRequestStats,
	RevokeUserModuleAccessResult,
	ReviewPaymentRequestDto,
} from '@/lib/types/subscriptions';

export type ApiFetcher = <T>(path: string, options?: FetchOptions) => Promise<T>;

function buildQuery(params: object): string {
	const qs = new URLSearchParams();

	for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
		if (value == null || value === '') continue;
		qs.set(key, String(value));
	}

	return qs.toString();
}

function withQuery(path: string, params: object): string {
	const query = buildQuery(params);
	if (!query) return path;
	return `${path}?${query}`;
}

export function getPaymentInfo(
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentInfo> {
	return fetcher<PaymentInfo>('/subscriptions/payment-info', {
		cache: 'no-store',
		...opts,
	});
}

export function createPaymentRequest(
	dto: CreatePaymentRequestDto,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestRecord> {
	return fetcher<PaymentRequestRecord>('/subscriptions/payment-requests', {
		method: 'POST',
		body: dto,
		cache: 'no-store',
		...opts,
	});
}

export function getMyPaymentRequests(
	params: ListMyPaymentRequestsParams = {},
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestPage> {
	const path = withQuery('/subscriptions/payment-requests/me', params);
	return fetcher<PaymentRequestPage>(path, {
		cache: 'no-store',
		...opts,
	});
}

export function getMyPaymentRequestById(
	id: number,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestRecord> {
	return fetcher<PaymentRequestRecord>(`/subscriptions/payment-requests/me/${id}`, {
		cache: 'no-store',
		...opts,
	});
}

export function cancelMyPaymentRequest(
	id: number,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestRecord> {
	return fetcher<PaymentRequestRecord>(`/subscriptions/payment-requests/me/${id}/cancel`, {
		method: 'PATCH',
		cache: 'no-store',
		...opts,
	});
}

export function getMyModules(
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<MyModuleAccessRecord[]> {
	return fetcher<MyModuleAccessRecord[]>('/subscriptions/my-modules', {
		cache: 'no-store',
		...opts,
	});
}

export function getAdminPaymentRequests(
	params: ListAdminPaymentRequestsParams = {},
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestPage> {
	const path = withQuery('/admin/subscriptions/payment-requests', params);
	return fetcher<PaymentRequestPage>(path, {
		cache: 'no-store',
		...opts,
	});
}

export function getAdminPaymentRequestStats(
	params: Omit<ListAdminPaymentRequestsParams, 'status' | 'page' | 'limit'> = {},
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestStats> {
	const path = withQuery('/admin/subscriptions/payment-requests/stats', params);
	return fetcher<PaymentRequestStats>(path, {
		cache: 'no-store',
		...opts,
	});
}

export function getAdminPaymentRequestById(
	id: number,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestRecord> {
	return fetcher<PaymentRequestRecord>(`/admin/subscriptions/payment-requests/${id}`, {
		cache: 'no-store',
		...opts,
	});
}

export function reviewAdminPaymentRequest(
	id: number,
	dto: ReviewPaymentRequestDto,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<PaymentRequestRecord> {
	return fetcher<PaymentRequestRecord>(`/admin/subscriptions/payment-requests/${id}/review`, {
		method: 'PATCH',
		body: dto,
		cache: 'no-store',
		...opts,
	});
}

export function grantGlobalModuleAccess(
	dto: GlobalModuleAccessDto,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<GlobalModuleAccessMutationResult> {
	return fetcher<GlobalModuleAccessMutationResult>('/admin/subscriptions/user-access/grant-global', {
		method: 'POST',
		body: dto,
		cache: 'no-store',
		...opts,
	});
}

export function revokeGlobalModuleAccess(
	dto: GlobalModuleAccessDto,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<GlobalModuleAccessMutationResult> {
	return fetcher<GlobalModuleAccessMutationResult>('/admin/subscriptions/user-access/revoke-global', {
		method: 'POST',
		body: dto,
		cache: 'no-store',
		...opts,
	});
}

export function getAdminUserModuleAccess(
	userId: number,
	params: ListAdminUserModuleAccessParams = {},
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<AdminUserModuleAccessPage> {
	const path = withQuery(`/admin/subscriptions/user-access/${userId}`, params);
	return fetcher<AdminUserModuleAccessPage>(path, {
		cache: 'no-store',
		...opts,
	});
}

export function grantUserModuleAccess(
	dto: GrantUserModuleAccessDto,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<GrantUserModuleAccessResult> {
	return fetcher<GrantUserModuleAccessResult>('/admin/subscriptions/user-access/grant', {
		method: 'POST',
		body: dto,
		cache: 'no-store',
		...opts,
	});
}

export function revokeUserModuleAccess(
	userId: number,
	moduleId: number,
	fetcher: ApiFetcher = apiFetch,
	opts?: FetchOptions,
): Promise<RevokeUserModuleAccessResult> {
	return fetcher<RevokeUserModuleAccessResult>(
		`/admin/subscriptions/user-access/${userId}/${moduleId}`,
		{
			method: 'DELETE',
			cache: 'no-store',
			...opts,
		},
	);
}
