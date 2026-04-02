import type { Metadata } from 'next';
import { apiFetch } from '@/lib/api/client';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { MyPaymentRequestsPanel } from '@/components/payments/my-payment-requests-panel';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
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

	return (
		<>
			<header className="flex items-center gap-2 h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
				<div className="flex items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbPage>Payments</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<MyPaymentRequestsPanel initialRequests={initialRequests} paymentInfo={paymentInfo} />
		</>
	);
}
