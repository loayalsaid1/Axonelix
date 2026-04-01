import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentInfo, PaymentRequestStatus } from '@/lib/types/subscriptions';

interface PaymentMethodCardProps {
	paymentInfo: PaymentInfo;
	statusCounts: Record<PaymentRequestStatus, number>;
}

export function PaymentMethodCard({ paymentInfo, statusCounts }: PaymentMethodCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment Method</CardTitle>
				<CardDescription>
					Each module costs {paymentInfo.moduleFeePounds} {paymentInfo.currency}.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2 text-sm sm:grid-cols-2">
				<div>
					<p className="text-muted-foreground">Instapay Handle</p>
					<p className="font-medium">{paymentInfo.instapayHandle ?? 'Not configured yet'}</p>
				</div>
				<div>
					<p className="text-muted-foreground">Queue Snapshot (this page)</p>
					<p className="font-medium">
						Pending {statusCounts.pending} · Approved {statusCounts.approved} · Rejected {statusCounts.rejected}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
