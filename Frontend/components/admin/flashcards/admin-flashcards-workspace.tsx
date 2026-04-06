"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/shared/admin-page-header";
import { AdminEmptyState } from "@/components/admin/shared/admin-empty-state";
import { AdminCardsManager } from "@/components/admin/flashcards/admin-cards-manager";
import { LessonHierarchyPicker } from "@/components/admin/flashcards/lesson-hierarchy-picker";
import {
	AdminDeckSection,
	LessonContextSection,
} from "@/components/admin/flashcards/admin-flashcards-sections";
import { useAdminLessonHierarchy } from "@/hooks/admin/flashcards/use-admin-lesson-hierarchy";
import { useAdminFlashcardsDeck } from "@/hooks/admin/flashcards/use-admin-flashcards-deck";
import { type PendingHierarchyAction } from "@/lib/types/admin-flashcards.types";
import { useApiFetch } from "@/hooks/use-api-fetch";
import { Skeleton } from "@/components/ui/skeleton";
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

export function AdminFlashcardsWorkspace() {
	const authFetch = useApiFetch();

	const hierarchy = useAdminLessonHierarchy(authFetch);
	const deck = useAdminFlashcardsDeck(authFetch, hierarchy.selectedLessonId);

	const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
	const [pendingHierarchyAction, setPendingHierarchyAction] = useState<PendingHierarchyAction | null>(null);

	const hierarchyInteractionLocked =
		deck.deckLoading || deck.deckSubmitting || deck.cardMutating || deck.orderSaving;

	const applyHierarchyAction = useCallback(
		(action: PendingHierarchyAction) => {
			switch (action.kind) {
				case "module":
					hierarchy.setSelectedModuleId(action.moduleId);
					break;
				case "subject":
					hierarchy.setSelectedSubjectId(action.subjectId);
					break;
				case "chapter":
					hierarchy.setSelectedChapterId(action.chapterId);
					break;
				case "lesson":
					hierarchy.setSelectedLessonId(action.lessonId);
					break;
				case "reset":
					hierarchy.resetSelection();
					break;
			}
		},
		[hierarchy],
	);

	const requestHierarchyAction = useCallback(
		(action: PendingHierarchyAction) => {
			if (hierarchyInteractionLocked) {
				return;
			}

			if (deck.orderDirty) {
				setPendingHierarchyAction(action);
				setConfirmDiscardOpen(true);
				return;
			}

			applyHierarchyAction(action);
		},
		[applyHierarchyAction, deck.orderDirty, hierarchyInteractionLocked],
	);

	const confirmDiscardAndContinue = useCallback(() => {
		if (pendingHierarchyAction) {
			applyHierarchyAction(pendingHierarchyAction);
			toast.message("Unsaved order changes were discarded.");
		}

		setConfirmDiscardOpen(false);
		setPendingHierarchyAction(null);
	}, [applyHierarchyAction, pendingHierarchyAction]);

	return (
		<div className="p-8">
			<AdminPageHeader
				title="Flashcards"
				description="Build and maintain official Axonelix flashcard decks for each lesson."
				className="mb-8"
			/>

			<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
				<LessonHierarchyPicker
					modules={hierarchy.modules}
					subjects={hierarchy.subjects}
					chapters={hierarchy.chapters}
					lessons={hierarchy.lessons}
					selectedModuleId={hierarchy.selectedModuleId}
					selectedSubjectId={hierarchy.selectedSubjectId}
					selectedChapterId={hierarchy.selectedChapterId}
					selectedLessonId={hierarchy.selectedLessonId}
					loading={hierarchy.hierarchyLoading}
					disabled={hierarchyInteractionLocked}
					onModuleChange={(moduleId) => requestHierarchyAction({ kind: "module", moduleId })}
					onSubjectChange={(subjectId) => requestHierarchyAction({ kind: "subject", subjectId })}
					onChapterChange={(chapterId) => requestHierarchyAction({ kind: "chapter", chapterId })}
					onLessonChange={(lessonId) => requestHierarchyAction({ kind: "lesson", lessonId })}
					onReset={() => requestHierarchyAction({ kind: "reset" })}
				/>

				<div className="flex flex-col gap-6">
					{!hierarchy.selectedLessonId ? (
						<AdminEmptyState
							title="Select a lesson"
							description="Choose module, subject, chapter, and lesson from the left panel to manage admin flashcards."
						/>
					) : deck.deckLoading ? (
						<div className="flex flex-col gap-6">
							<Skeleton className="h-36 w-full rounded-xl" />
							<Skeleton className="h-52 w-full rounded-xl" />
							<Skeleton className="h-64 w-full rounded-xl" />
						</div>
					) : (
						<>
							<LessonContextSection
								selectedLessonId={hierarchy.selectedLessonId}
								selectedPath={deck.selectedPath}
							/>

							<AdminDeckSection
								deck={deck.deck}
								deckName={deck.deckName}
								deckDescription={deck.deckDescription}
								deckSubmitting={deck.deckSubmitting}
								cardMutating={deck.cardMutating}
								orderSaving={deck.orderSaving}
								deckMetaDirty={deck.deckMetaDirty}
								onDeckNameChange={deck.setDeckName}
								onDeckDescriptionChange={deck.setDeckDescription}
								onCreateDeck={deck.createDeck}
								onUpdateDeck={deck.updateDeck}
							/>

							{deck.deck ? (
								<AdminCardsManager
									cards={deck.cards}
									orderDirty={deck.orderDirty}
									isMutating={deck.cardMutating}
									isSavingOrder={deck.orderSaving}
									onCreateCard={deck.handleCreateCard}
									onEditCard={deck.handleEditCard}
									onDeleteCard={deck.handleDeleteCard}
									onMoveCard={deck.handleMoveCard}
									onSaveOrder={deck.handleSaveOrder}
									onDiscardOrderChanges={deck.handleDiscardOrderChanges}
								/>
							) : (
								<AdminEmptyState
									title="Create deck to start"
									description="After creating the admin deck, you can add, edit, delete, and reorder flashcards for this lesson."
								/>
							)}
						</>
					)}
				</div>
			</div>

			<AlertDialog
				open={confirmDiscardOpen}
				onOpenChange={(open) => {
					setConfirmDiscardOpen(open);
					if (!open) {
						setPendingHierarchyAction(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Discard unsaved card order changes?</AlertDialogTitle>
						<AlertDialogDescription>
							You have unsaved card order changes for this lesson. Switching context now will discard those
							local changes.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Stay Here</AlertDialogCancel>
						<AlertDialogAction variant="destructive" onClick={confirmDiscardAndContinue}>
							Discard And Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
