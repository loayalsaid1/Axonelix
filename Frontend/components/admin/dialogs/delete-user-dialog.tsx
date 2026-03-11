'use client';

import { useState } from 'react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AdminUserProfile } from '@/lib/types';

interface DeleteUserDialogProps {
	user: AdminUserProfile | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (user: AdminUserProfile) => Promise<void>;
}

export function DeleteUserDialog({
	user,
	open,
	onOpenChange,
	onConfirm,
}: DeleteUserDialogProps) {
	const [loading, setLoading] = useState(false);

	const handleConfirm = async () => {
		if (!user) return;
		setLoading(true);
		try {
			await onConfirm(user);
			onOpenChange(false);
		} finally {
			setLoading(false);
		}
	};

	const displayName =
		user?.firstName || user?.lastName
			? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
			: user?.email;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete user?</AlertDialogTitle>
					<AlertDialogDescription>
						This will permanently delete <strong>{displayName}</strong> and revoke their access.
						This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						disabled={loading}
						variant={"destructive"}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{loading ? 'Deleting…' : 'Delete'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
