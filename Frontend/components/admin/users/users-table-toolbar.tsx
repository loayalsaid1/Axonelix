'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Role } from '@/lib/types';

interface UsersTableToolbarProps {
	roleFilter: Role | undefined;
	onRoleFilterChange: (role: Role | undefined) => void;
	selectedCount: number;
	onBulkDelete: () => void;
}

export function UsersTableToolbar({
	roleFilter,
	onRoleFilterChange,
	selectedCount,
	onBulkDelete,
}: UsersTableToolbarProps) {
	return (
		<div className="flex items-center justify-between gap-4">
			<Select
				value={roleFilter ?? 'all'}
				onValueChange={(val) =>
					onRoleFilterChange(val === 'all' ? undefined : (val as Role))
				}
			>
				<SelectTrigger className="w-40">
					<SelectValue placeholder="All roles" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All roles</SelectItem>
					<SelectItem value={Role.Student}>Students</SelectItem>
					<SelectItem value={Role.Admin}>Admins</SelectItem>
				</SelectContent>
			</Select>

			{selectedCount > 0 && (
				<Button variant="destructive" size="sm" onClick={onBulkDelete} className="gap-2">
					<Trash2 className="h-4 w-4" />
					Delete {selectedCount} selected
				</Button>
			)}
		</div>
	);
}
