import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentRequestEvent } from '@/lib/types/subscriptions';

interface AdminPaymentRequestTimelineCardProps {
	timeline: PaymentRequestEvent[];
	formatDate: (val: string | null) => string;
}

export function AdminPaymentRequestTimelineCard({
	timeline,
	formatDate,
}: AdminPaymentRequestTimelineCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Timeline</CardTitle>
			</CardHeader>
			<CardContent>
				{timeline.length ? (
					<ul className="space-y-4">
						{timeline.map((event) => (
							<li key={event.id} className="space-y-1 rounded-md border p-3">
								<p className="text-sm font-medium">
									{event.fromStatus ?? 'created'} → {event.toStatus}
								</p>
								<p className="text-xs text-muted-foreground">
									{formatDate(event.createdAt)} by{' '}
									{event.actorUser?.email ?? `User #${event.actorUserId}`}
								</p>
								{event.note && (
									<p className="text-sm text-muted-foreground">{event.note}</p>
								)}
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground">No timeline events available.</p>
				)}
			</CardContent>
		</Card>
	);
}
