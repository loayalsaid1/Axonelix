'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { reviewAdminPaymentRequest } from '@/lib/api/subscriptions';
import { AdminPaymentRequestHeader } from '@/components/admin/subscriptions/admin-payment-request-header';
import { AdminPaymentRequestProofCard } from '@/components/admin/subscriptions/admin-payment-request-proof-card';
import { AdminPaymentRequestDecisionCard } from '@/components/admin/subscriptions/admin-payment-request-decision-card';
import { AdminPaymentRequestTimelineCard } from '@/components/admin/subscriptions/admin-payment-request-timeline-card';
import type { PaymentRequestRecord } from '@/lib/types/subscriptions';

interface AdminPaymentRequestReviewProps {
	initialRequest: PaymentRequestRecord;
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

export function AdminPaymentRequestReview({
	initialRequest,
}: AdminPaymentRequestReviewProps) {
	const authFetch = useApiFetch();
	const [request, setRequest] = useState<PaymentRequestRecord>(initialRequest);
	const [reviewNote, setReviewNote] = useState('');
	const [submittingAction, setSubmittingAction] = useState<'approve' | 'reject' | null>(null);

	const canReview = request.status === 'pending';

	const timeline = useMemo(() => request.events ?? [], [request.events]);

	const submitReview = async (action: 'approve' | 'reject') => {
		if (action === 'reject' && !reviewNote.trim()) {
			toast.error('Please provide a rejection reason.');
			return;
		}

		try {
			setSubmittingAction(action);
			const updated = await reviewAdminPaymentRequest(
				request.id,
				{
					action,
					reviewNote: reviewNote.trim() || undefined,
				},
				authFetch,
			);
			setRequest(updated);
			setReviewNote('');
			toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update request.';
			toast.error(message);
		} finally {
			setSubmittingAction(null);
		}
	};

	return (
		<div className="space-y-6 p-8">
			<AdminPaymentRequestHeader
				request={request}
				formattedDate={formatDateTime(request.createdAt)}
			/>

			<div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
				<AdminPaymentRequestProofCard request={request} />

				<div className="space-y-6">
					<AdminPaymentRequestDecisionCard
						canReview={canReview}
						reviewNote={reviewNote}
						submittingAction={submittingAction}
						onNoteChange={setReviewNote}
						onSubmit={submitReview}
					/>

					<AdminPaymentRequestTimelineCard
						timeline={timeline}
						formatDate={formatDateTime}
					/>
				</div>
			</div>
		</div>
	);
}
