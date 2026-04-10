import { ShieldMinus } from 'lucide-react';
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

interface UserAccessRevokeDialogProps {
	open: boolean;
	moduleName: string;
	submitting: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

export function UserAccessRevokeDialog({
	open,
	moduleName,
	submitting,
	onOpenChange,
	onConfirm,
}: UserAccessRevokeDialogProps) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Revoke module access?</AlertDialogTitle>
					<AlertDialogDescription>
						This will remove active access to {moduleName} for this user.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={submitting}
						className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						<ShieldMinus className="h-4 w-4" />
						{submitting ? 'Revoking...' : 'Confirm Revoke'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
