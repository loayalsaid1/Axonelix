import type { PaginatedResponse } from '@/lib/types';

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';

export interface PaymentInfo {
	moduleFeePounds: number;
	moduleFeePiasters: number;
	currency: 'EGP';
	paymentMethod: 'instapay';
	instapayHandle: string | null;
	instapayQrCodeUrl: string | null;
}

export interface PaymentRequestUserSummary {
	id: number;
	email: string;
}

export interface PaymentRequestModuleSummary {
	id: number;
	name: string;
	description?: string | null;
}

export interface PaymentProofImage {
	id: string;
	url: string;
	status: 'pending' | 'committed' | 'deleted';
}

export interface PaymentRequestEvent {
	id: number;
	paymentRequestId: number;
	fromStatus: PaymentRequestStatus | null;
	toStatus: PaymentRequestStatus;
	actorUserId: number;
	note: string | null;
	createdAt: string;
	actorUser?: PaymentRequestUserSummary;
}

export interface PaymentRequestRecord {
	id: number;
	userId: number;
	moduleId: number;
	status: PaymentRequestStatus;
	proofImageId: string | null;
	submitNote: string | null;
	reviewNote: string | null;
	reviewedBy: number | null;
	reviewedAt: string | null;
	moduleFeePiasters: number;
	createdAt: string;
	updatedAt: string;
	user?: PaymentRequestUserSummary;
	module?: PaymentRequestModuleSummary;
	proofImage?: PaymentProofImage;
	reviewedByUser?: PaymentRequestUserSummary;
	events?: PaymentRequestEvent[];
}

export interface CreatePaymentRequestDto {
	moduleId: number;
	proofImageId: string;
	submitNote?: string;
}

export interface ListMyPaymentRequestsParams {
	status?: PaymentRequestStatus;
	page?: number;
	limit?: number;
}

export interface ListAdminPaymentRequestsParams {
	status?: PaymentRequestStatus;
	moduleId?: number;
	userId?: number;
	fromDate?: string;
	toDate?: string;
	query?: string;
	page?: number;
	limit?: number;
}

export type PaymentRequestReviewAction = 'approve' | 'reject';

export interface ReviewPaymentRequestDto {
	action: PaymentRequestReviewAction;
	reviewNote?: string;
}

export interface PaymentRequestStats {
	pendingReview: number;
	approvedToday: number;
	totalApprovedVolumePiasters: number;
	totalApprovedVolumePounds: number;
	flaggedRequests: number;
	currency: 'EGP';
	generatedAt: string;
}

export type GlobalModuleAccessScope = 'all_modules' | 'single_module';

export interface GlobalModuleAccessDto {
	moduleId?: number;
}

export interface GlobalModuleAccessMutationResult {
	action: 'grant' | 'revoke';
	scope: GlobalModuleAccessScope;
	moduleId: number | null;
	affectedAccessRows: number;
	affectedUsers: number;
	performedBy: number;
	performedAt: string;
}

export type PaymentRequestPage = PaginatedResponse<PaymentRequestRecord>;
