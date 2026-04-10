import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { getAdminUserById } from '@/lib/api/admin-users';
import { UserAccessManagementPanel } from '@/components/admin/users/user-access-management-panel';
import { UserAccessRouteModal } from '@/components/admin/users/user-access-route-modal';
import type { ModuleName } from '@/lib/types/materials';
import type { AdminUserModuleAccessPage } from '@/lib/types/subscriptions';

interface AdminUserAccessModalPageProps {
	params: Promise<{ id: string }>;
}

export default async function AdminUserAccessModalPage({ params }: AdminUserAccessModalPageProps) {
	const { id } = await params;
	const userId = Number(id);

	if (!Number.isInteger(userId) || userId <= 0) {
		notFound();
	}

	const opts = await serverAuthOpts();

	try {
		const [user, modules, initialAccess] = await Promise.all([
			getAdminUserById(userId, opts),
			apiFetch<ModuleName[]>('/materials/modules/names', {
				cache: 'no-store',
				...opts,
			}),
			apiFetch<AdminUserModuleAccessPage>(
				`/admin/subscriptions/user-access/${userId}?page=1&limit=20`,
				{
					cache: 'no-store',
					...opts,
				},
			),
		]);

		return (
			<UserAccessRouteModal>
				<UserAccessManagementPanel
					user={user}
					modules={modules}
					initialAccess={initialAccess}
					headerClassName="mb-4"
				/>
			</UserAccessRouteModal>
		);
	} catch {
		notFound();
	}
}
