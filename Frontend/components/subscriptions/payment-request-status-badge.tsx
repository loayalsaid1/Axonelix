import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PaymentRequestStatus } from '@/lib/types/subscriptions';

interface PaymentRequestStatusBadgeProps {
	status: PaymentRequestStatus;
	className?: string;
}

const STATUS_LABEL: Record<PaymentRequestStatus, string> = {
	pending: 'Pending',
	approved: 'Approved',
	rejected: 'Rejected',
	canceled: 'Canceled',
};

const STATUS_CLASS: Record<PaymentRequestStatus, string> = {
	pending: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
	approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
	rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
	canceled: 'border-muted-foreground/20 bg-muted text-muted-foreground',
};

export function PaymentRequestStatusBadge({
	status,
	className,
}: PaymentRequestStatusBadgeProps) {
	return (
		<Badge
			variant="outline"
			className={cn('font-medium', STATUS_CLASS[status], className)}
		>
			{STATUS_LABEL[status]}
		</Badge>
	);
}
