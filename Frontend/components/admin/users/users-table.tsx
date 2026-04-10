'use client';

import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { KeyRound, Trash2 } from 'lucide-react';
import type { AdminUserProfile, Role } from '@/lib/types';

interface UsersTableProps {
	users: AdminUserProfile[];
	loading: boolean;
	selectedIds: Set<number>;
	onSelectToggle: (id: number) => void;
	onSelectAll: (select: boolean) => void;
	onDeleteUser: (user: AdminUserProfile) => void;
	onManageAccess: (user: AdminUserProfile) => string;
}

const ROLE_VARIANT: Record<Role, 'default' | 'secondary'> = {
	admin: 'default',
	student: 'secondary',
};

function formatDate(value: string | null): string {
	if (!value) return '—';
	return new Date(value).toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

function userInitials(user: AdminUserProfile): string {
	const first = user.firstName?.[0] ?? '';
	const last = user.lastName?.[0] ?? '';
	return (first + last).toUpperCase() || user.email[0].toUpperCase();
}

export function UsersTable({
	users,
	loading,
	selectedIds,
	onSelectToggle,
	onSelectAll,
	onDeleteUser,
	onManageAccess,
}: UsersTableProps) {
	const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

	if (loading) {
		return (
			<div className="flex items-center justify-center py-16 text-muted-foreground">
				Loading users…
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="flex items-center justify-center py-16 text-muted-foreground">
				No users found.
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-10">
						<Checkbox
							checked={allSelected}
							onCheckedChange={(checked) => onSelectAll(!!checked)}
							aria-label="Select all"
						/>
					</TableHead>
					<TableHead>User</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Role</TableHead>
					<TableHead>Joined</TableHead>
					<TableHead>Last Sign In</TableHead>
					<TableHead className="w-10" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{users.map((user) => (
					<TableRow key={user.id} data-selected={selectedIds.has(user.id)}>
						<TableCell>
							<Checkbox
								checked={selectedIds.has(user.id)}
								onCheckedChange={() => onSelectToggle(user.id)}
								aria-label={`Select ${user.email}`}
							/>
						</TableCell>
						<TableCell>
							<div className="flex items-center gap-3">
								<Avatar className="h-8 w-8">
									<AvatarImage src={user.imageUrl ?? undefined} alt={user.email} />
									<AvatarFallback>{userInitials(user)}</AvatarFallback>
								</Avatar>
								<span className="font-medium">
									{user.firstName || user.lastName
										? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
										: '—'}
								</span>
							</div>
						</TableCell>
						<TableCell className="text-muted-foreground">{user.email}</TableCell>
						<TableCell>
							<Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
						</TableCell>
						<TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
						<TableCell className="text-muted-foreground">
							{formatDate(user.lastSignInAt)}
						</TableCell>
						<TableCell>
							<div className="flex items-center justify-end gap-1">
								<Button asChild variant="ghost" size="icon" aria-label={`Manage access for ${user.email}`}>
									<Link href={onManageAccess(user)}>
										<KeyRound className="h-4 w-4" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onDeleteUser(user)}
									aria-label={`Delete ${user.email}`}
								>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
