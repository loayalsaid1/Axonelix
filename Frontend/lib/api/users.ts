import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { apiFetch } from './client';
import { UserRecord } from '../types';

/**
 * Fetches the current user's database record by calling /users/me with the
 * Clerk JWT. Wrapped in React cache() so multiple Server Components in the
 * same render tree share a single request.
 */
export const getCurrentUser = cache(async (): Promise<UserRecord | null> => {
	const { getToken } = await auth();
	const token = await getToken();

	if (!token) return null;

	try {
		return await apiFetch<UserRecord>('/users/me', {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
	} catch {
		return null;
	}
});
