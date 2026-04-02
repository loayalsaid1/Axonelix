import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentInfo } from '@/lib/types/subscriptions';

interface PaymentGuideProps {
	paymentInfo: PaymentInfo | null;
}

export function PaymentGuide({ paymentInfo }: PaymentGuideProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Payment Guide</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-sm">
				<div className="rounded-lg border p-3">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Module fee</p>
					<p className="font-semibold">
						{paymentInfo
							? `${paymentInfo.moduleFeePounds} ${paymentInfo.currency}`
							: 'Not configured'}
					</p>
				</div>
				<div className="rounded-lg border p-3">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">Instapay handle</p>
					<p className="font-medium">{paymentInfo?.instapayHandle ?? 'Not configured'}</p>
				</div>
				{paymentInfo?.instapayQrCodeUrl && (
					<div className="space-y-2 rounded-lg border p-3">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Instapay QR</p>
						<img
							src={paymentInfo.instapayQrCodeUrl}
							alt="Instapay QR code"
							className="max-h-56 w-full rounded-md border object-contain"
						/>
					</div>
				)}
				<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
					<li>Ensure transaction details are clearly visible in the proof image.</li>
					<li>Use your own payment account to avoid delayed verification.</li>
					<li>Admin review typically completes within a few business hours.</li>
				</ul>
			</CardContent>
		</Card>
	);
}
