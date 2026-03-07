/**
 * Thin wrapper around fetch() for calling the NestJS backend.
 * All admin Next.js API routes should use this instead of direct DB access.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

async function request<T = unknown>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});

	if (res.status === 204) {
		return undefined as T;
	}

	const data = await res.json();

	if (!res.ok) {
		throw Object.assign(
			new Error(data?.message ?? data?.error ?? `Request failed: ${res.status}`),
			{ status: res.status, data },
		);
	}

	return data as T;
}

export const api = {
	get: <T = unknown>(path: string) => request<T>(path),
	post: <T = unknown>(path: string, body: unknown) =>
		request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
	patch: <T = unknown>(path: string, body: unknown) =>
		request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
	delete: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
};
