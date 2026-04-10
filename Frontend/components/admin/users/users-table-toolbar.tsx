'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { Role } from '@/lib/types';

type CreatedAtSortOrder = 'asc' | 'desc';

interface UsersTableToolbarProps {
	roleFilter: Role | undefined;
	onRoleFilterChange: (role: Role | undefined) => void;
	searchTerm: string;
	onSearchTermChange: (value: string) => void;
	sortCreatedAt: CreatedAtSortOrder;
	onSortCreatedAtChange: (value: CreatedAtSortOrder) => void;
	selectedCount: number;
	onBulkDelete: () => void;
}

export function UsersTableToolbar({
	roleFilter,
	onRoleFilterChange,
	searchTerm,
	onSearchTermChange,
	sortCreatedAt,
	onSortCreatedAtChange,
	selectedCount,
	onBulkDelete,
}: UsersTableToolbarProps) {
	return (
		<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					value={searchTerm}
					onChange={(event) => onSearchTermChange(event.target.value)}
					placeholder="Search by email or name"
					className="w-full sm:w-80"
				/>
				<Select
					value={roleFilter ?? 'all'}
					onValueChange={(val) =>
						onRoleFilterChange(val === 'all' ? undefined : (val as Role))
					}
				>
					<SelectTrigger className="w-full sm:w-40">
						<SelectValue placeholder="All roles" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All roles</SelectItem>
						<SelectItem value={Role.Student}>Students</SelectItem>
						<SelectItem value={Role.Admin}>Admins</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={sortCreatedAt}
					onValueChange={(value) => onSortCreatedAtChange(value as CreatedAtSortOrder)}
				>
					<SelectTrigger className="w-full sm:w-48">
						<SelectValue placeholder="Sort by joined" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="desc">Newest first</SelectItem>
						<SelectItem value="asc">Oldest first</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{selectedCount > 0 && (
				<Button variant="destructive" size="sm" onClick={onBulkDelete} className="gap-2">
					<Trash2 className="h-4 w-4" />
					Delete {selectedCount} selected
				</Button>
			)}
		</div>
	);
}
