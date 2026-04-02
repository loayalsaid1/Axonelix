import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentRequestRecord } from '@/lib/types/subscriptions';

interface AdminPaymentRequestProofCardProps {
	request: PaymentRequestRecord;
}

function isLikelyImageUrl(url: string): boolean {
	if (url.startsWith('data:image/')) return true;
	return /\.(png|jpe?g|webp|gif|avif|svg)(?:$|[?#])/i.test(url);
}

export function AdminPaymentRequestProofCard({ request }: AdminPaymentRequestProofCardProps) {
	return (
		<Card className="xl:col-span-2">
			<CardHeader>
				<CardTitle>Proof of Payment</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{request.proofImage?.url ? (
					<a href={request.proofImage.url} target="_blank" rel="noreferrer">
						{isLikelyImageUrl(request.proofImage.url) ? (
							<img
								src={request.proofImage.url}
								alt={`Proof image for request ${request.id}`}
								className="max-h-[440px] w-full rounded-lg border object-contain"
							/>
						) : (
							<div className="rounded-lg border border-dashed p-6 text-sm text-primary underline-offset-4 hover:underline">
								Open uploaded file
							</div>
						)}
					</a>
				) : (
					<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
						No proof image is attached.
					</div>
				)}

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Module</p>
						<p className="font-medium">{request.module?.name ?? `Module #${request.moduleId}`}</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Fee</p>
						<p className="font-medium">{(request.moduleFeePiasters / 100).toFixed(2)} EGP</p>
					</div>
					<div className="md:col-span-2">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">Student Note</p>
						<p className="text-sm text-muted-foreground">
							{request.submitNote?.trim() || 'No note provided.'}
						</p>
					</div>
					{request.reviewNote && (
						<div className="md:col-span-2">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">Review Note</p>
							<p className="text-sm text-muted-foreground">{request.reviewNote}</p>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
