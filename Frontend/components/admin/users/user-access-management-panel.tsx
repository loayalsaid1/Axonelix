'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { useAdminUserModuleAccess } from '@/hooks/admin/use-admin-user-module-access';
import type { ModuleName } from '@/lib/types/materials';
import type { AdminUserProfile } from '@/lib/types';
import type { AdminUserModuleAccessPage } from '@/lib/types/subscriptions';
import { UserAccessGrantCard } from './user-access/user-access-grant-card';
import { UserAccessRecordsCard } from './user-access/user-access-records-card';
import { UserAccessRevokeDialog } from './user-access/user-access-revoke-dialog';
import { displayName } from './user-access/user-access-utils';

interface UserAccessManagementPanelProps {
	user: AdminUserProfile;
	modules: ModuleName[];
	initialAccess: AdminUserModuleAccessPage | null;
	headerClassName?: string;
}

export function UserAccessManagementPanel({
	user,
	modules,
	initialAccess,
	headerClassName,
}: UserAccessManagementPanelProps) {
	const [selectedModuleId, setSelectedModuleId] = useState('');
	const [pendingRevokeModuleId, setPendingRevokeModuleId] = useState<number | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const {
		data,
		loading,
		error,
		filters,
		activeAccessMap,
		setPage,
		setIncludeRevoked,
		grant,
		revoke,
	} = useAdminUserModuleAccess(user.id, initialAccess);

	const grantableModules = useMemo(
		() => modules.filter((module) => !activeAccessMap.has(module.id)),
		[activeAccessMap, modules],
	);

	const revokeTarget = data.data.find((record) => record.moduleId === pendingRevokeModuleId) ?? null;

	const handleGrant = async () => {
		const selectedGrantModule = grantableModules.find(
			(module) => String(module.id) === selectedModuleId,
		);

		if (!selectedGrantModule) {
			toast.error('Select a module first.');
			return;
		}

		try {
			setSubmitting(true);
			const result = await grant(selectedGrantModule.id, 'manual_grant');
			if (!result.granted) {
				toast.warning('User already has active access to this module.');
				return;
			}

			toast.success(`Access granted for ${selectedGrantModule.name}.`);
			setSelectedModuleId('');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to grant access.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleRevoke = async () => {
		if (!pendingRevokeModuleId) return;

		try {
			setSubmitting(true);
			await revoke(pendingRevokeModuleId);
			toast.success('Access revoked successfully.');
			setPendingRevokeModuleId(null);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to revoke access.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="space-y-6">
			<AdminPageHeader
				title="Manage Module Access"
				description={`${displayName(user)} (${user.email})`}
				className={headerClassName}
			/>

			<UserAccessGrantCard
				grantableModules={grantableModules}
				selectedModuleId={selectedModuleId}
				submitting={submitting}
				onModuleChange={setSelectedModuleId}
				onGrant={handleGrant}
			/>

			<UserAccessRecordsCard
				data={data}
				loading={loading}
				error={error}
				includeRevoked={filters.includeRevoked ?? false}
				submitting={submitting}
				onIncludeRevokedChange={setIncludeRevoked}
				onRequestRevoke={setPendingRevokeModuleId}
				onPageChange={setPage}
			/>

			<UserAccessRevokeDialog
				open={pendingRevokeModuleId != null}
				moduleName={revokeTarget?.module?.name ?? 'this module'}
				submitting={submitting}
				onOpenChange={(open) => !open && setPendingRevokeModuleId(null)}
				onConfirm={handleRevoke}
			/>
		</div>
	);
}
