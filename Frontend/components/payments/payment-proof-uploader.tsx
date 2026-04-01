'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { uploadPaymentProof } from '@/lib/services/payment-proof-upload.service';

interface PaymentProofUploaderProps {
	disabled?: boolean;
	onUploadComplete: (details: { id: string; url: string; mimeType: string }) => void;
	onUploadError: (error: Error) => void;
	onUploadStart: () => void;
}

export function PaymentProofUploader({
	disabled,
	onUploadComplete,
	onUploadError,
	onUploadStart,
}: PaymentProofUploaderProps) {
	const authFetch = useApiFetch();
	const [uploadProgress, setUploadProgress] = useState<number>(0);
	const [uploading, setUploading] = useState(false);
	const [previewInfo, setPreviewInfo] = useState<{ url: string; mimeType: string } | null>(null);

	const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		try {
			setUploading(true);
			setUploadProgress(0);
			onUploadStart();

			const uploaded = await uploadPaymentProof(
				file,
				authFetch,
				(progress) => setUploadProgress(progress),
			);

			const fileType = file.type || '';
			setPreviewInfo({ url: uploaded.url, mimeType: fileType });
			toast.success('Payment proof uploaded successfully.');
			
			onUploadComplete({
				id: uploaded.imageId,
				url: uploaded.url,
				mimeType: fileType,
			});
		} catch (err) {
			setPreviewInfo(null);
			const error = err instanceof Error ? err : new Error('Failed to upload proof image.');
			toast.error(error.message);
			onUploadError(error);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="proof-upload">Proof of payment</Label>
				<label
					htmlFor="proof-upload"
					className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center transition-colors hover:border-primary/50"
				>
					<UploadCloud className="h-8 w-8 text-muted-foreground" />
					<p className="text-sm font-medium">Click to upload your Instapay receipt</p>
					<p className="text-xs text-muted-foreground">PNG, JPG, WEBP or PDF up to 10MB</p>
				</label>
				<input
					id="proof-upload"
					type="file"
					accept="image/png,image/jpeg,image/webp,application/pdf"
					onChange={onFileChange}
					className="hidden"
					disabled={disabled || uploading}
				/>
			</div>

			{uploading && (
				<div className="space-y-2">
					<Progress value={uploadProgress} />
					<p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
				</div>
			)}

			{previewInfo && (
				<div className="space-y-2 rounded-lg border p-3">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Uploaded proof preview
					</p>
					{previewInfo.mimeType.startsWith('image/') ? (
						<img
							src={previewInfo.url}
							alt="Uploaded payment proof"
							className="max-h-56 w-full rounded-md border object-contain"
						/>
					) : (
						<a
							href={previewInfo.url}
							target="_blank"
							rel="noreferrer"
							className="inline-flex text-sm text-primary underline-offset-4 hover:underline"
						>
							Open uploaded file
						</a>
					)}
				</div>
			)}
		</div>
	);
}
