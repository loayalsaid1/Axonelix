'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { PaymentRequestStatusBadge } from '@/components/subscriptions/payment-request-status-badge';
import { PaymentMethodCard } from '@/components/payments/payment-method-card';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { cancelMyPaymentRequest, getMyPaymentRequests } from '@/lib/api/subscriptions';
import type {
	ListMyPaymentRequestsParams,
	PaymentInfo,
	PaymentRequestPage,
	PaymentRequestRecord,
	PaymentRequestStatus,
} from '@/lib/types/subscriptions';

interface MyPaymentRequestsPanelProps {
	initialRequests: PaymentRequestPage | null;
	paymentInfo: PaymentInfo | null;
}

const DEFAULT_LIMIT = 20;

const EMPTY_PAGE: PaymentRequestPage = {
	data: [],
	total: 0,
	page: 1,
	limit: DEFAULT_LIMIT,
	totalPages: 1,
};

function formatDate(value: string): string {
	return new Date(value).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function MyPaymentRequestsPanel({
	initialRequests,
	paymentInfo,
}: MyPaymentRequestsPanelProps) {
	const authFetch = useApiFetch();
	const [result, setResult] = useState<PaymentRequestPage>(initialRequests ?? EMPTY_PAGE);
	const [loading, setLoading] = useState(!initialRequests);
	const [error, setError] = useState<string | null>(null);
	const [skipInitialFetch, setSkipInitialFetch] = useState(Boolean(initialRequests));
	const [filters, setFilters] = useState<ListMyPaymentRequestsParams>({
		page: 1,
		limit: DEFAULT_LIMIT,
	});
	const [actioningId, setActioningId] = useState<number | null>(null);

	const statusCounts = useMemo(() => {
		const counts: Record<PaymentRequestStatus, number> = {
			pending: 0,
			approved: 0,
			rejected: 0,
			canceled: 0,
		};

		for (const item of result.data) {
			counts[item.status] += 1;
		}

		return counts;
	}, [result.data]);

	useEffect(() => {
		if (skipInitialFetch) {
			setSkipInitialFetch(false);
			return;
		}

		let canceled = false;

		const run = async () => {
			try {
				setLoading(true);
				setError(null);
				const next = await getMyPaymentRequests(filters, authFetch);
				if (canceled) return;
				setResult(next);
			} catch (err) {
				if (canceled) return;
				setError(err instanceof Error ? err.message : 'Failed to load requests.');
			} finally {
				if (!canceled) {
					setLoading(false);
				}
			}
		};

		run();
		return () => {
			canceled = true;
		};
	}, [authFetch, filters, skipInitialFetch]);

	const cancelRequest = async (request: PaymentRequestRecord) => {
		try {
			setActioningId(request.id);
			const updated = await cancelMyPaymentRequest(request.id, authFetch);
			setResult((prev) => ({
				...prev,
				data: prev.data.map((item) => (item.id === request.id ? updated : item)),
			}));
			toast.success('Request canceled successfully.');
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to cancel request.');
		} finally {
			setActioningId(null);
		}
	};

	return (
		<div className="space-y-6 p-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">My Payment Requests</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Track your module access requests and review outcomes.
					</p>
				</div>
				<Button asChild className="gap-2">
					<Link href="/payments/request">
						<Plus className="h-4 w-4" />
						New Request
					</Link>
				</Button>
			</div>

			{paymentInfo && (
				<PaymentMethodCard paymentInfo={paymentInfo} statusCounts={statusCounts} />
			)}

			<div className="flex items-center justify-between gap-3">
				<Select
					value={filters.status ?? 'all'}
					onValueChange={(value) =>
						setFilters((prev) => ({
							...prev,
							status: value === 'all' ? undefined : (value as PaymentRequestStatus),
							page: 1,
						}))
					}
				>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="All statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All statuses</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="approved">Approved</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
						<SelectItem value="canceled">Canceled</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{error && (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			<div className="rounded-xl border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Module</TableHead>
							<TableHead>Submitted</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Admin Note</TableHead>
							<TableHead className="text-right">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
									Loading requests...
								</TableCell>
							</TableRow>
						) : result.data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
									No payment requests found.
								</TableCell>
							</TableRow>
						) : (
							result.data.map((request) => (
								<TableRow key={request.id}>
									<TableCell className="font-medium">
										{request.module?.name ?? `Module #${request.moduleId}`}
									</TableCell>
									<TableCell>{formatDate(request.createdAt)}</TableCell>
									<TableCell>
										<PaymentRequestStatusBadge status={request.status} />
									</TableCell>
									<TableCell className="text-muted-foreground">
										{request.reviewNote?.trim() || '—'}
									</TableCell>
									<TableCell className="text-right">
										{request.status === 'pending' ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => cancelRequest(request)}
												disabled={actioningId === request.id}
												className="gap-2"
											>
												<XCircle className="h-4 w-4" />
												{actioningId === request.id ? 'Canceling...' : 'Cancel'}
											</Button>
										) : (
											<span className="text-xs text-muted-foreground">—</span>
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{result.totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() =>
									setFilters((prev) => ({
										...prev,
										page: Math.max(1, (prev.page ?? 1) - 1),
									}))
								}
								aria-disabled={(filters.page ?? 1) === 1}
								className={(filters.page ?? 1) === 1 ? 'pointer-events-none opacity-50' : ''}
							/>
						</PaginationItem>
						<PaginationItem className="px-4 text-sm text-muted-foreground">
							Page {result.page} of {result.totalPages}
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								onClick={() =>
									setFilters((prev) => ({
										...prev,
										page: Math.min(result.totalPages, (prev.page ?? 1) + 1),
									}))
								}
								aria-disabled={(filters.page ?? 1) >= result.totalPages}
								className={
									(filters.page ?? 1) >= result.totalPages
										? 'pointer-events-none opacity-50'
										: ''
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
}
