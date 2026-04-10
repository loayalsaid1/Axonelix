'use client';

import { useRouter } from 'next/navigation';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface UserAccessRouteModalProps {
	children: React.ReactNode;
}

export function UserAccessRouteModal({ children }: UserAccessRouteModalProps) {
	const router = useRouter();

	return (
		<Dialog open onOpenChange={() => router.back()}>
			<DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
				<DialogHeader>
					<DialogTitle>User Access</DialogTitle>
					<DialogDescription>
						Grant or revoke module access for a specific user.
					</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
