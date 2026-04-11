'use client';

import { useState } from 'react';
import { useAdminUsers } from '@/hooks/admin/use-admin-users';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { UsersTableToolbar } from '@/components/admin/users/users-table-toolbar';
import { UsersTable } from '@/components/admin/users/users-table';
import { DeleteUserDialog } from '@/components/admin/dialogs/delete-user-dialog';
import { BulkDeleteUsersDialog } from '@/components/admin/dialogs/bulk-delete-users-dialog';
import { QuestionsPagination } from '@/components/library/QuestionsPagination';
import type { AdminUserProfile, PaginatedResponse } from '@/lib/types';

interface UsersPanelProps {
	initialData: PaginatedResponse<AdminUserProfile> | null;
}

export function UsersPanel({ initialData }: UsersPanelProps) {
	const {
		users,
		total,
		page,
		limit,
		totalPages,
		loading,
		error,
		roleFilter,
		searchTerm,
		sortCreatedAt,
		setPage,
		setLimit,
		setRoleFilter,
		setSearchTerm,
		setSortCreatedAt,
		deleteUser,
		bulkDelete,
	} = useAdminUsers(initialData ?? undefined);

	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [userToDelete, setUserToDelete] = useState<AdminUserProfile | null>(null);
	const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

	const handleSelectToggle = (id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSelectAll = (select: boolean) => {
		setSelectedIds(select ? new Set(users.map((u) => u.id)) : new Set());
	};

	const handleDeleteConfirm = async (user: AdminUserProfile) => {
		await deleteUser(user.id);
		setSelectedIds((prev) => {
			const next = new Set(prev);
			next.delete(user.id);
			return next;
		});
	};

	const handleBulkDeleteConfirm = async () => {
		await bulkDelete(Array.from(selectedIds));
		setSelectedIds(new Set());
	};

	return (
		<div className="p-8 space-y-6">
			<AdminPageHeader
				title="Users"
				description={`${total} registered user${total !== 1 ? 's' : ''}`}
			/>

			<UsersTableToolbar
				roleFilter={roleFilter}
				onRoleFilterChange={(role) => {
					setRoleFilter(role);
					setPage(1);
					setSelectedIds(new Set());
				}}
				searchTerm={searchTerm}
				onSearchTermChange={(value) => {
					setSearchTerm(value);
					setPage(1);
					setSelectedIds(new Set());
				}}
				sortCreatedAt={sortCreatedAt}
				onSortCreatedAtChange={(value) => {
					setSortCreatedAt(value);
					setPage(1);
					setSelectedIds(new Set());
				}}
				selectedCount={selectedIds.size}
				onBulkDelete={() => setBulkDialogOpen(true)}
			/>

			{error && (
				<p className="text-sm text-destructive">Failed to load users. Please try again.</p>
			)}

			<UsersTable
				users={users}
				loading={loading}
				selectedIds={selectedIds}
				onSelectToggle={handleSelectToggle}
				onSelectAll={handleSelectAll}
				onDeleteUser={(user) => setUserToDelete(user)}
				onManageAccess={(user) => `/admin/users/${user.id}/access`}
			/>

			{totalPages > 1 && (
				<QuestionsPagination
					currentPage={page}
					totalPages={totalPages}
					limit={limit}
					total={total}
					onPageChange={setPage}
					onLimitChange={(newLimit) => {
						setLimit(newLimit);
						setPage(1);
					}}
				/>
			)}

			<DeleteUserDialog
				user={userToDelete}
				open={!!userToDelete}
				onOpenChange={(open) => !open && setUserToDelete(null)}
				onConfirm={handleDeleteConfirm}
			/>

			<BulkDeleteUsersDialog
				count={selectedIds.size}
				open={bulkDialogOpen}
				onOpenChange={setBulkDialogOpen}
				onConfirm={handleBulkDeleteConfirm}
			/>
		</div>
	);
}
