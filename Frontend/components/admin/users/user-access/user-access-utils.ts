import type { AdminUserProfile } from '@/lib/types';

export function formatDateTime(value: string | null): string {
	if (!value) return '—';
	return new Date(value).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function displayName(user: AdminUserProfile): string {
	const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
	return fullName || user.email;
}
