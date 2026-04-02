import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AdminPaymentRequestDecisionCardProps {
	canReview: boolean;
	reviewNote: string;
	submittingAction: 'approve' | 'reject' | null;
	onNoteChange: (note: string) => void;
	onSubmit: (action: 'approve' | 'reject') => void;
}

export function AdminPaymentRequestDecisionCard({
	canReview,
	reviewNote,
	submittingAction,
	onNoteChange,
	onSubmit,
}: AdminPaymentRequestDecisionCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Review Decision</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="review-note">Review note</Label>
					<Textarea
						id="review-note"
						placeholder="Add context for this decision..."
						value={reviewNote}
						onChange={(event) => onNoteChange(event.target.value)}
						rows={5}
						disabled={!canReview || submittingAction !== null}
					/>
				</div>
				<div className="flex flex-col gap-2">
					<Button
						onClick={() => onSubmit('approve')}
						disabled={!canReview || submittingAction !== null}
						className="gap-2"
					>
						<CheckCircle2 className="h-4 w-4" />
						{submittingAction === 'approve' ? 'Approving...' : 'Approve Access'}
					</Button>
					<Button
						variant="destructive"
						onClick={() => onSubmit('reject')}
						disabled={!canReview || submittingAction !== null}
						className="gap-2"
					>
						<XCircle className="h-4 w-4" />
						{submittingAction === 'reject' ? 'Rejecting...' : 'Reject Request'}
					</Button>
				</div>
				{!canReview && (
					<p className="text-xs text-muted-foreground">
						This request has already been reviewed.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
