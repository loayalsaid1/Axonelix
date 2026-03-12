import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import { apiFetch } from './client';
import type { UserDashboardStats } from '../types/quizzes';

/**
 * Fetches the current user's dashboard stats from GET /users/me/stats.
 * Wrapped in React cache() so multiple Server Components in the same
 * render tree share a single request.
 */
export const getUserDashboardStats = cache(async (): Promise<UserDashboardStats | null> => {
	const { getToken } = await auth();
	const token = await getToken();

	if (!token) return null;

	try {
		return await apiFetch<UserDashboardStats>('/users/me/stats', {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
	} catch {
		return null;
	}
});
