import type { Metadata } from 'next';
import { serverAuthOpts } from '@/lib/api/server-auth-opts';
import { RequestModuleAccessForm } from '@/components/payments/request-module-access-form';
import { getModuleNamesWithAccess } from '@/lib/api/materials';
import { getPaymentInfo } from '@/lib/api/subscriptions';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { ModuleName } from '@/lib/types/materials';
import type { PaymentInfo } from '@/lib/types/subscriptions';

export const metadata: Metadata = { title: 'Request Module Access' };

export default async function RequestModuleAccessPage() {
	const opts = await serverAuthOpts();

	let modules: ModuleName[] = [];
	let paymentInfo: PaymentInfo | null = null;

	try {
		const [modulesRes, infoRes] = await Promise.all([
			getModuleNamesWithAccess({
				cache: 'no-store',
				...opts,
			}),
			getPaymentInfo(undefined, {
				cache: 'no-store',
				...opts,
			}),
		]);

		modules = modulesRes;
		paymentInfo = infoRes;
	} catch {
		// Client form can still render and show fallback states.
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
								<BreadcrumbLink href="/payments">Payments</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>New Request</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
			</header>

			<div className="space-y-6 p-6 pt-2">
				<div className="space-y-1">
					<h1 className="font-semibold text-2xl tracking-tight">Request Module Access</h1>
					<p className="max-w-2xl text-muted-foreground text-sm">
						Select a locked module, upload your payment proof, and submit it for review.
					</p>
				</div>

				<RequestModuleAccessForm modules={modules} paymentInfo={paymentInfo} />
			</div>
		</>
	);
}
