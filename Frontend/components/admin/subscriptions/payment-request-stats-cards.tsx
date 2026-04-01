import { AlertTriangle, CheckCircle2, Clock3, WalletCards } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentRequestStats } from '@/lib/types/subscriptions';

interface PaymentRequestStatsCardsProps {
	stats: PaymentRequestStats;
}

function formatMoneyEgp(valueInPounds: number): string {
	return new Intl.NumberFormat('en-EG', {
		maximumFractionDigits: 2,
		minimumFractionDigits: 0,
	}).format(valueInPounds);
}

export function PaymentRequestStatsCards({ stats }: PaymentRequestStatsCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<Clock3 className="h-4 w-4" />
						Pending Review
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold tracking-tight">{stats.pendingReview}</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<CheckCircle2 className="h-4 w-4" />
						Approved Today
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold tracking-tight">{stats.approvedToday}</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<WalletCards className="h-4 w-4" />
						Approved Volume
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold tracking-tight">
						{formatMoneyEgp(stats.totalApprovedVolumePounds)} EGP
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
						<AlertTriangle className="h-4 w-4" />
						Flagged Requests
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-2xl font-bold tracking-tight">{stats.flaggedRequests}</p>
				</CardContent>
			</Card>
		</div>
	);
}
