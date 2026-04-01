'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { createPaymentRequest } from '@/lib/api/subscriptions';
import { PaymentGuide } from '@/components/payments/payment-guide';
import { PaymentProofUploader } from '@/components/payments/payment-proof-uploader';
import type { ModuleName } from '@/lib/types/materials';
import type { PaymentInfo } from '@/lib/types/subscriptions';

interface RequestModuleAccessFormProps {
	modules: ModuleName[];
	paymentInfo: PaymentInfo | null;
}

export function RequestModuleAccessForm({
	modules,
	paymentInfo,
}: RequestModuleAccessFormProps) {
	const router = useRouter();
	const authFetch = useApiFetch();

	const [moduleId, setModuleId] = useState<string>('');
	const [submitNote, setSubmitNote] = useState('');
	const [proofImageId, setProofImageId] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const moduleOptions = useMemo(
		() => modules.filter((module) => module.accessStatus !== 'owned'),
		[modules],
	);

	const submitRequest = async () => {
		if (!moduleId) {
			toast.error('Please select a module first.');
			return;
		}
		if (!proofImageId) {
			toast.error('Please upload your payment proof image.');
			return;
		}

		try {
			setSubmitting(true);
			await createPaymentRequest(
				{
					moduleId: Number(moduleId),
					proofImageId,
					submitNote: submitNote.trim() || undefined,
				},
				authFetch,
			);
			toast.success('Your request has been submitted for review.');
			router.push('/payments');
			router.refresh();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Failed to submit request.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
			<Card className="lg:col-span-3">
				<CardHeader>
					<CardTitle>Request Details</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label>Module</Label>
						<Select value={moduleId} onValueChange={setModuleId}>
							<SelectTrigger>
								<SelectValue placeholder="Select a locked module" />
							</SelectTrigger>
							<SelectContent>
								{moduleOptions.length ? (
									moduleOptions.map((module) => (
										<SelectItem key={module.id} value={String(module.id)}>
											{module.name}
										</SelectItem>
									))
								) : (
									<SelectItem value="none" disabled>
										No locked modules available
									</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<PaymentProofUploader
							disabled={submitting || uploading}
							onUploadStart={() => setUploading(true)}
							onUploadComplete={({ id }) => {
								setProofImageId(id);
								setUploading(false);
							}}
							onUploadError={() => setUploading(false)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="submit-note">Optional note</Label>
						<Textarea
							id="submit-note"
							rows={5}
							value={submitNote}
							onChange={(event) => setSubmitNote(event.target.value)}
							placeholder="Add transaction context (optional)..."
							disabled={submitting}
						/>
					</div>

					<Button onClick={submitRequest} disabled={submitting || uploading} className="gap-2">
						{submitting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Send className="h-4 w-4" />
						)}
						{submitting ? 'Submitting...' : 'Submit Access Request'}
					</Button>
				</CardContent>
			</Card>

			<div className="lg:col-span-2">
				<PaymentGuide paymentInfo={paymentInfo} />
			</div>
		</div>
	);
}
