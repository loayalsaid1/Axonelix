import type { Metadata } from 'next';
import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { MyPaymentRequestsPanel } from '@/components/payments/my-payment-requests-panel';
import type { PaymentInfo, PaymentRequestPage } from '@/lib/types/subscriptions';

export const metadata: Metadata = { title: 'My Payment Requests' };

export default async function PaymentsPage() {
	const opts = await serverAuthOpts();
	let initialRequests: PaymentRequestPage | null = null;
	let paymentInfo: PaymentInfo | null = null;

	try {
		const [requestsRes, infoRes] = await Promise.all([
			apiFetch<PaymentRequestPage>('/subscriptions/payment-requests/me?page=1&limit=20', {
				cache: 'no-store',
				...opts,
			}),
			apiFetch<PaymentInfo>('/subscriptions/payment-info', {
				cache: 'no-store',
				...opts,
			}),
		]);

		initialRequests = requestsRes;
		paymentInfo = infoRes;
	} catch {
		// Client panel handles fallback and retry behavior.
	}

	return <MyPaymentRequestsPanel initialRequests={initialRequests} paymentInfo={paymentInfo} />;
}
