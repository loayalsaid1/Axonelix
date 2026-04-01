import type { Metadata } from 'next';
import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { RequestModuleAccessForm } from '@/components/payments/request-module-access-form';
import type { ModuleName } from '@/lib/types/materials';
import type { PaymentInfo } from '@/lib/types/subscriptions';

export const metadata: Metadata = { title: 'Request Module Access' };

export default async function RequestModuleAccessPage() {
	const opts = await serverAuthOpts();

	let modules: ModuleName[] = [];
	let paymentInfo: PaymentInfo | null = null;

	try {
		const [modulesRes, infoRes] = await Promise.all([
			apiFetch<ModuleName[]>('/materials/modules/names', {
				cache: 'no-store',
				...opts,
			}),
			apiFetch<PaymentInfo>('/subscriptions/payment-info', {
				cache: 'no-store',
				...opts,
			}),
		]);

		modules = modulesRes;
		paymentInfo = infoRes;
	} catch {
		// Client form can still render and show fallback states.
	}

	return <RequestModuleAccessForm modules={modules} paymentInfo={paymentInfo} />;
}
