import { AlertCircle, ShieldMinus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { formatDateTime } from './user-access-utils';
import type { AdminUserModuleAccessPage } from '@/lib/types/subscriptions';

interface UserAccessRecordsCardProps {
	data: AdminUserModuleAccessPage;
	loading: boolean;
	error: string | null;
	includeRevoked: boolean;
	submitting: boolean;
	onIncludeRevokedChange: (next: boolean) => void;
	onRequestRevoke: (moduleId: number) => void;
	onPageChange: (nextPage: number) => void;
}

export function UserAccessRecordsCard({
	data,
	loading,
	error,
	includeRevoked,
	submitting,
	onIncludeRevokedChange,
	onRequestRevoke,
	onPageChange,
}: UserAccessRecordsCardProps) {
	return (
		<Card>
			<CardHeader className="space-y-4">
				<div>
					<CardTitle className="text-base">Access Records</CardTitle>
					<CardDescription>
						View active access and optionally include revoked records.
					</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Checkbox
						id="include-revoked"
						checked={includeRevoked}
						onCheckedChange={(checked) => onIncludeRevokedChange(Boolean(checked))}
					/>
					<Label htmlFor="include-revoked" className="text-sm font-normal">
						Include revoked access
					</Label>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
						<AlertCircle className="h-4 w-4" />
						{error}
					</div>
				)}

				{loading ? (
					<div className="rounded-lg border p-6 text-sm text-muted-foreground">
						Loading access records...
					</div>
				) : data.data.length === 0 ? (
					<div className="rounded-lg border p-6 text-sm text-muted-foreground">
						No module access records found.
					</div>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Module</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Granted At</TableHead>
									<TableHead>Granted By</TableHead>
									<TableHead>Source</TableHead>
									<TableHead className="text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data.data.map((record) => {
									const isRevoked = Boolean(record.revokedAt);
									return (
										<TableRow key={record.id}>
											<TableCell className="font-medium">
												{record.module?.name ?? `Module #${record.moduleId}`}
											</TableCell>
											<TableCell>{isRevoked ? 'Revoked' : 'Active'}</TableCell>
											<TableCell>{formatDateTime(record.grantedAt)}</TableCell>
											<TableCell>
												{record.grantedByUser?.email
													?? (record.grantedBy ? `User #${record.grantedBy}` : 'System')}
											</TableCell>
											<TableCell>{record.source}</TableCell>
											<TableCell className="text-right">
												{!isRevoked && (
													<Button
														variant="destructive"
														size="sm"
														onClick={() => onRequestRevoke(record.moduleId)}
														disabled={submitting}
														className="gap-2"
													>
														<ShieldMinus className="h-4 w-4" />
														Revoke
													</Button>
												)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}

				{data.totalPages > 1 && (
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => onPageChange(Math.max(1, data.page - 1))}
									aria-disabled={data.page === 1}
									className={data.page === 1 ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>
							<PaginationItem className="flex items-center px-4 text-sm text-muted-foreground">
								Page {data.page} of {data.totalPages}
							</PaginationItem>
							<PaginationItem>
								<PaginationNext
									onClick={() => onPageChange(Math.min(data.totalPages, data.page + 1))}
									aria-disabled={data.page >= data.totalPages}
									className={
										data.page >= data.totalPages
											? 'pointer-events-none opacity-50'
											: ''
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</CardContent>
		</Card>
	);
}
