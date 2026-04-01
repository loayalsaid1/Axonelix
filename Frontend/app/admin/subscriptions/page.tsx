import type { Metadata } from 'next';
import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { AdminPaymentRequestsPanel } from '@/components/admin/subscriptions/admin-payment-requests-panel';
import type { ModuleName } from '@/lib/types/materials';
import type {
	PaymentRequestPage,
	PaymentRequestStats,
} from '@/lib/types/subscriptions';

export const metadata: Metadata = { title: 'Payment Requests' };

export default async function AdminSubscriptionsPage() {
	const opts = await serverAuthOpts();

	let initialRequests: PaymentRequestPage | null = null;
	let initialStats: PaymentRequestStats | null = null;
	let modules: ModuleName[] = [];

	try {
		const [requestsRes, statsRes, modulesRes] = await Promise.all([
			apiFetch<PaymentRequestPage>('/admin/subscriptions/payment-requests?page=1&limit=20', {
				cache: 'no-store',
				...opts,
			}),
			apiFetch<PaymentRequestStats>('/admin/subscriptions/payment-requests/stats', {
				cache: 'no-store',
				...opts,
			}),
			apiFetch<ModuleName[]>('/materials/modules/names', {
				cache: 'no-store',
				...opts,
			}),
		]);

		initialRequests = requestsRes;
		initialStats = statsRes;
		modules = modulesRes;
	} catch {
		// Client panel handles fallback loading/error states.
	}

	return (
		<AdminPaymentRequestsPanel
			initialRequests={initialRequests}
			initialStats={initialStats}
			modules={modules}
		/>
	);
}
