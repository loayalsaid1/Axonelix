'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageHeader } from '@/components/admin/shared/admin-page-header';
import { GlobalModuleAccessControls } from '@/components/admin/subscriptions/global-module-access-controls';
import { PaymentRequestStatsCards } from '@/components/admin/subscriptions/payment-request-stats-cards';
import { PaymentRequestFilters } from '@/components/admin/subscriptions/payment-request-filters';
import { PaymentRequestsTable } from '@/components/admin/subscriptions/payment-requests-table';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { useApiFetch } from '@/hooks/use-api-fetch';
import {
	getAdminPaymentRequests,
	getAdminPaymentRequestStats,
} from '@/lib/api/subscriptions';
import type { ModuleName } from '@/lib/types/materials';
import type {
	ListAdminPaymentRequestsParams,
	PaymentRequestPage,
	PaymentRequestStats,
} from '@/lib/types/subscriptions';

interface AdminPaymentRequestsPanelProps {
	initialRequests: PaymentRequestPage | null;
	initialStats: PaymentRequestStats | null;
	modules: ModuleName[];
}

const DEFAULT_LIMIT = 20;

const EMPTY_PAGE: PaymentRequestPage = {
	data: [],
	total: 0,
	page: 1,
	limit: DEFAULT_LIMIT,
	totalPages: 1,
};

const EMPTY_STATS: PaymentRequestStats = {
	pendingReview: 0,
	approvedToday: 0,
	totalApprovedVolumePiasters: 0,
	totalApprovedVolumePounds: 0,
	flaggedRequests: 0,
	currency: 'EGP',
	generatedAt: new Date(0).toISOString(),
};

export function AdminPaymentRequestsPanel({
	initialRequests,
	initialStats,
	modules,
}: AdminPaymentRequestsPanelProps) {
	const authFetch = useApiFetch();
	const [requests, setRequests] = useState<PaymentRequestPage>(initialRequests ?? EMPTY_PAGE);
	const [stats, setStats] = useState<PaymentRequestStats>(initialStats ?? EMPTY_STATS);
	const [loading, setLoading] = useState(!initialRequests || !initialStats);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<ListAdminPaymentRequestsParams>({
		page: 1,
		limit: DEFAULT_LIMIT,
	});
	const [skipInitialFetch, setSkipInitialFetch] = useState(
		Boolean(initialRequests && initialStats),
	);

	const statsFilters = useMemo(
		() => ({
			moduleId: filters.moduleId,
			userId: filters.userId,
			fromDate: filters.fromDate,
			toDate: filters.toDate,
			query: filters.query,
		}),
		[filters.moduleId, filters.userId, filters.fromDate, filters.toDate, filters.query],
	);

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

				const [nextRequests, nextStats] = await Promise.all([
					getAdminPaymentRequests(filters, authFetch),
					getAdminPaymentRequestStats(statsFilters, authFetch),
				]);

				if (canceled) return;
				setRequests(nextRequests);
				setStats(nextStats);
			} catch (err) {
				if (canceled) return;
				const message =
					err instanceof Error ? err.message : 'Failed to load payment requests.';
				setError(message);
				toast.error(message);
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
	}, [
		authFetch,
		filters,
		skipInitialFetch,
		statsFilters,
	]);

	const updateFilters = (next: Partial<ListAdminPaymentRequestsParams>) => {
		setFilters((prev) => ({
			...prev,
			...next,
			limit: prev.limit ?? DEFAULT_LIMIT,
		}));
	};

	const refresh = async () => {
		setFilters((prev) => ({ ...prev }));
	};

	return (
		<div className="space-y-6 p-8">
			<AdminPageHeader
				title="Payment Requests"
				description="Review, approve, and audit module access requests."
			>
				<Button variant="outline" size="sm" onClick={refresh} className="gap-2">
					<RefreshCcw className="h-4 w-4" />
					Refresh
				</Button>
			</AdminPageHeader>

			<PaymentRequestStatsCards stats={stats} />

			<GlobalModuleAccessControls
				modules={modules}
				onMutationCompleted={() => {
					setFilters((prev) => ({ ...prev }));
				}}
			/>

			<PaymentRequestFilters
				filters={filters}
				modules={modules}
				onChange={updateFilters}
			/>

			{error && (
				<div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
					<AlertCircle className="h-4 w-4" />
					{error}
				</div>
			)}

			<PaymentRequestsTable requests={requests.data} loading={loading} />

			{requests.totalPages > 1 && (
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() =>
									updateFilters({ page: Math.max(1, (filters.page ?? 1) - 1) })
								}
								aria-disabled={(filters.page ?? 1) === 1}
								className={(filters.page ?? 1) === 1 ? 'pointer-events-none opacity-50' : ''}
							/>
						</PaginationItem>
						<PaginationItem className="flex items-center px-4 text-sm text-muted-foreground">
							Page {requests.page} of {requests.totalPages}
						</PaginationItem>
						<PaginationItem>
							<PaginationNext
								onClick={() =>
									updateFilters({
										page: Math.min(requests.totalPages, (filters.page ?? 1) + 1),
									})
								}
								aria-disabled={(filters.page ?? 1) >= requests.totalPages}
								className={
									(filters.page ?? 1) >= requests.totalPages
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
