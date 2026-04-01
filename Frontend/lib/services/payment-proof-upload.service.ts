import type { FetchOptions } from '@/lib/api/client';

const DEFAULT_UPLOAD_FOLDER = '/test/images/payment-proofs';
const MAX_PROOF_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface UploadPaymentProofResult {
	imageId: string;
	url: string;
}

interface ImageKitAuthPayload {
	signature: string;
	expire: number;
	token: string;
}

interface ImageKitUploadResponse {
	url: string;
	fileId: string;
}

interface CreatedImageRecord {
	id: string;
	url: string;
}

export type ApiFetcher = <T>(path: string, options?: FetchOptions) => Promise<T>;

export async function uploadPaymentProof(
	file: File,
	fetcher: ApiFetcher,
	onProgress?: (progress: number) => void,
	abortSignal?: AbortSignal,
): Promise<UploadPaymentProofResult> {
	if (!file) {
		throw new Error('No file selected.');
	}

	if (file.size > MAX_PROOF_SIZE_BYTES) {
		throw new Error('Proof image exceeds the 10MB size limit.');
	}

	const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
	if (!publicKey) {
		throw new Error('Image upload is not configured. Missing NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY.');
	}

	const authPayload = await fetcher<ImageKitAuthPayload>('/images/imagekit_auth', {
		cache: 'no-store',
	});

	const formData = new FormData();
	formData.append('file', file);
	formData.append('fileName', file.name || `proof-${Date.now()}`);
	formData.append('publicKey', publicKey);
	formData.append('signature', authPayload.signature);
	formData.append('expire', String(authPayload.expire));
	formData.append('token', authPayload.token);
	formData.append(
		'folder',
		process.env.NEXT_PUBLIC_IMAGEKIT_UPLOAD_FOLDER || DEFAULT_UPLOAD_FOLDER,
	);

	const uploaded = await new Promise<ImageKitUploadResponse>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');

		xhr.upload.onprogress = (event) => {
			if (!onProgress || !event.lengthComputable) return;
			onProgress(Math.round((event.loaded / event.total) * 100));
		};

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve(JSON.parse(xhr.responseText) as ImageKitUploadResponse);
				return;
			}
			reject(new Error('Failed to upload proof to ImageKit.'));
		};

		xhr.onerror = () => reject(new Error('Network error while uploading proof.'));

		if (abortSignal) {
			abortSignal.addEventListener('abort', () => {
				xhr.abort();
				reject(new Error('Upload canceled.'));
			});
		}

		xhr.send(formData);
	});

	const imageRecord = await fetcher<CreatedImageRecord>('/images', {
		method: 'POST',
		body: {
			url: uploaded.url,
			imagekitFileId: uploaded.fileId,
		},
		cache: 'no-store',
	});

	return {
		imageId: imageRecord.id,
		url: imageRecord.url,
	};
}
