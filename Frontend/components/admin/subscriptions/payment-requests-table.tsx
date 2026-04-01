import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PaymentRequestStatusBadge } from '@/components/subscriptions/payment-request-status-badge';
import type { PaymentRequestRecord } from '@/lib/types/subscriptions';

interface PaymentRequestsTableProps {
	requests: PaymentRequestRecord[];
	loading: boolean;
}

function isLikelyImageUrl(url: string): boolean {
	if (url.startsWith('data:image/')) return true;
	return /\.(png|jpe?g|webp|gif|avif|svg)(?:$|[?#])/i.test(url);
}

function formatDateTime(value: string | null): string {
	if (!value) return '—';
	return new Date(value).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
}

function formatMoneyEgp(valueInPiasters: number): string {
	return `${(valueInPiasters / 100).toFixed(2)} EGP`;
}

export function PaymentRequestsTable({ requests, loading }: PaymentRequestsTableProps) {
	if (loading) {
		return (
			<div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
				Loading payment requests...
			</div>
		);
	}

	if (!requests.length) {
		return (
			<div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
				No payment requests found for the selected filters.
			</div>
		);
	}

	return (
		<div className="rounded-xl border bg-card">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Student</TableHead>
						<TableHead>Module</TableHead>
						<TableHead>Submitted</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Fee</TableHead>
						<TableHead>Proof</TableHead>
						<TableHead className="text-right">Action</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{requests.map((request) => (
						<TableRow key={request.id}>
							<TableCell className="font-medium">
								{request.user?.email ?? `User #${request.userId}`}
							</TableCell>
							<TableCell>{request.module?.name ?? `Module #${request.moduleId}`}</TableCell>
							<TableCell>{formatDateTime(request.createdAt)}</TableCell>
							<TableCell>
								<PaymentRequestStatusBadge status={request.status} />
							</TableCell>
							<TableCell>{formatMoneyEgp(request.moduleFeePiasters)}</TableCell>
							<TableCell>
								{request.proofImage?.url ? (
									<a
										href={request.proofImage.url}
										target="_blank"
										rel="noreferrer"
										className="inline-block text-sm text-primary underline-offset-4 hover:underline"
									>
										{isLikelyImageUrl(request.proofImage.url) ? (
											<img
												src={request.proofImage.url}
												alt={`Proof for request ${request.id}`}
												className="h-12 w-12 rounded-md border object-cover"
											/>
										) : (
											'Open file'
										)}
									</a>
								) : (
									<span className="text-xs text-muted-foreground">No proof</span>
								)}
							</TableCell>
							<TableCell className="text-right">
								<Button asChild size="sm" variant="outline">
									<Link href={`/admin/subscriptions/${request.id}`}>
										{request.status === 'pending' ? 'Review' : 'View'}
									</Link>
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
