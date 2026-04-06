"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Flashcard } from "@/lib/types/flashcards";
import { FlashcardFormDialog, type FlashcardFormValues } from "./flashcard-form-dialog";
import { AdminCardsPreviewPanel } from "./admin-cards-preview-panel";
import { AdminCardsTablePanel } from "./admin-cards-table-panel";

interface AdminCardsManagerProps {
	cards: Flashcard[];
	orderDirty: boolean;
	isMutating: boolean;
	isSavingOrder: boolean;
	onCreateCard: (values: FlashcardFormValues) => Promise<void>;
	onEditCard: (cardId: number, values: FlashcardFormValues) => Promise<void>;
	onDeleteCard: (cardId: number) => Promise<void>;
	onMoveCard: (index: number, direction: "up" | "down") => void;
	onSaveOrder: () => Promise<void>;
	onDiscardOrderChanges: () => void;
}

export function AdminCardsManager({
	cards,
	orderDirty,
	isMutating,
	isSavingOrder,
	onCreateCard,
	onEditCard,
	onDeleteCard,
	onMoveCard,
	onSaveOrder,
	onDiscardOrderChanges,
}: AdminCardsManagerProps) {
	const [createOpen, setCreateOpen] = useState(false);
	const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<Flashcard | null>(null);
	const interactionDisabled = isMutating || isSavingOrder;

	return (
		<div className="flex flex-col gap-6">
			<AdminCardsPreviewPanel
				cards={cards}
				isDisabled={interactionDisabled}
				onAddCard={() => setCreateOpen(true)}
			/>

			<AdminCardsTablePanel
				cards={cards}
				orderDirty={orderDirty}
				isMutating={isMutating}
				isSavingOrder={isSavingOrder}
				onCreateCard={() => setCreateOpen(true)}
				onEditCard={(card) => setEditingCard(card)}
				onDeleteCard={(card) => setDeleteCandidate(card)}
				onMoveCard={onMoveCard}
				onSaveOrder={onSaveOrder}
				onDiscardOrderChanges={onDiscardOrderChanges}
			/>

			<FlashcardFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				title="Create Flashcard"
				description="Add a new flashcard to the selected admin deck."
				submitLabel="Create Card"
				onSubmit={onCreateCard}
			/>

			<FlashcardFormDialog
				open={!!editingCard}
				onOpenChange={(open) => {
					if (!open) {
						setEditingCard(null);
					}
				}}
				title="Edit Flashcard"
				description="Update the front and back content of this card."
				submitLabel="Save Changes"
				initialValues={
					editingCard
						? {
							front: editingCard.front,
							back: editingCard.back,
						}
						: undefined
				}
				onSubmit={(values) => {
					if (!editingCard) {
						return Promise.resolve();
					}

					return onEditCard(editingCard.id, values).then(() => {
						setEditingCard(null);
					});
				}}
			/>

			<AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete flashcard?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone and will permanently remove the selected flashcard.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={isMutating}
							onClick={() => {
								if (!deleteCandidate) {
									return;
								}
								void onDeleteCard(deleteCandidate.id).then(() => setDeleteCandidate(null));
							}}
						>
							{isMutating ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
