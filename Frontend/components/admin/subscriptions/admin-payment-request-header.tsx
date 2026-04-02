import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PaymentRequestStatusBadge } from '@/components/subscriptions/payment-request-status-badge';
import type { PaymentRequestRecord } from '@/lib/types/subscriptions';

interface AdminPaymentRequestHeaderProps {
	request: PaymentRequestRecord;
	formattedDate: string;
}

export function AdminPaymentRequestHeader({
	request,
	formattedDate,
}: AdminPaymentRequestHeaderProps) {
	return (
		<div className="flex flex-col gap-3">
			<Link
				href="/admin/subscriptions"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to payment requests
			</Link>
			<div className="flex flex-wrap items-center gap-3">
				<h1 className="text-3xl font-bold tracking-tight">Review Request #{request.id}</h1>
				<PaymentRequestStatusBadge status={request.status} />
			</div>
			<p className="text-sm text-muted-foreground">
				Submitted {formattedDate} by {request.user?.email ?? `User #${request.userId}`}
			</p>
		</div>
	);
}
