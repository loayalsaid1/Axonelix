import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { UsersPanel } from '@/components/admin/users/users-panel';
import type { AdminUserProfile, PaginatedResponse } from '@/lib/types';

export default async function AdminUsersPage() {
	const opts = await serverAuthOpts();
	let initialData: PaginatedResponse<AdminUserProfile> | null = null;

	try {
		initialData = await apiFetch<PaginatedResponse<AdminUserProfile>>(
			'/admin/users?page=1&limit=20',
			{ cache: 'no-store', ...opts },
		);
	} catch {
		// Panel will handle the error state client-side
	}

	return <UsersPanel initialData={initialData} />;
}
