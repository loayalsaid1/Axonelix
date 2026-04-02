import {
	IsEnum,
	IsNotEmpty,
	IsString,
	MaxLength,
	ValidateIf,
} from 'class-validator';

export const PaymentReviewAction = {
	Approve: 'approve',
	Reject: 'reject',
} as const;

export type PaymentReviewAction =
	(typeof PaymentReviewAction)[keyof typeof PaymentReviewAction];

export class ReviewPaymentRequestDto {
	@IsEnum([PaymentReviewAction.Approve, PaymentReviewAction.Reject])
	action: PaymentReviewAction;

	@ValidateIf((o: ReviewPaymentRequestDto) => o.action === PaymentReviewAction.Reject)
	@IsNotEmpty()
	@IsString()
	@MaxLength(1500)
	reviewNote?: string;
}
