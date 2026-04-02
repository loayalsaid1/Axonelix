import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { AdminPaymentRequestReview } from '@/components/admin/subscriptions/admin-payment-request-review';
import type { PaymentRequestRecord } from '@/lib/types/subscriptions';

interface AdminPaymentRequestPageProps {
	params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: 'Review Payment Request' };

export default async function AdminPaymentRequestPage({ params }: AdminPaymentRequestPageProps) {
	const { id } = await params;
	const requestId = Number(id);

	if (!Number.isInteger(requestId) || requestId <= 0) {
		notFound();
	}

	const opts = await serverAuthOpts();

	try {
		const request = await apiFetch<PaymentRequestRecord>(
			`/admin/subscriptions/payment-requests/${requestId}`,
			{
				cache: 'no-store',
				...opts,
			},
		);

		return <AdminPaymentRequestReview initialRequest={request} />;
	} catch {
		notFound();
	}
}
