import { BookOpenCheck, Layers, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type FlashcardDeck } from "@/lib/types/flashcards";
import { type SelectedLessonPath } from "@/lib/types/admin-flashcards.types";

interface LessonContextSectionProps {
	selectedLessonId: number;
	selectedPath: SelectedLessonPath | null;
}

export function LessonContextSection({ selectedLessonId, selectedPath }: LessonContextSectionProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle className="inline-flex items-center gap-2">
							<BookOpenCheck className="size-4" />
							Lesson Context
						</CardTitle>
						<CardDescription>
							Flashcards in this workspace belong to the selected lesson only.
						</CardDescription>
					</div>
					<Badge variant="outline">Lesson ID: {selectedLessonId}</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-wrap items-center gap-2">
				{selectedPath ? (
					<>
						<Badge variant="secondary">{selectedPath.module.name}</Badge>
						<Badge variant="secondary">
							{selectedPath.subject.name} ({selectedPath.subject.type})
						</Badge>
						<Badge variant="secondary">{selectedPath.chapter.name}</Badge>
						<Badge>{selectedPath.lesson.name}</Badge>
					</>
				) : null}
			</CardContent>
		</Card>
	);
}

interface AdminDeckSectionProps {
	deck: FlashcardDeck | null;
	deckName: string;
	deckDescription: string;
	deckSubmitting: boolean;
	cardMutating: boolean;
	orderSaving: boolean;
	deckMetaDirty: boolean;
	onDeckNameChange: (value: string) => void;
	onDeckDescriptionChange: (value: string) => void;
	onCreateDeck: () => Promise<void>;
	onUpdateDeck: () => Promise<void>;
}

export function AdminDeckSection({
	deck,
	deckName,
	deckDescription,
	deckSubmitting,
	cardMutating,
	orderSaving,
	deckMetaDirty,
	onDeckNameChange,
	onDeckDescriptionChange,
	onCreateDeck,
	onUpdateDeck,
}: AdminDeckSectionProps) {
	const interactionDisabled = deckSubmitting || cardMutating || orderSaving;

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle className="inline-flex items-center gap-2">
							<Layers className="size-4" />
							Admin Deck
						</CardTitle>
						<CardDescription>
							Configure the official deck metadata before managing flashcards.
						</CardDescription>
					</div>
					{deck ? <Badge>Deck ID: {deck.id}</Badge> : <Badge variant="outline">Not created</Badge>}
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="grid gap-2">
					<label htmlFor="deck-name" className="text-sm font-medium">
						Deck Name
					</label>
					<Input
						id="deck-name"
						value={deckName}
						onChange={(event) => onDeckNameChange(event.target.value)}
						placeholder="Official deck name"
						disabled={interactionDisabled}
					/>
				</div>

				<div className="grid gap-2">
					<label htmlFor="deck-description" className="text-sm font-medium">
						Description
					</label>
					<Textarea
						id="deck-description"
						value={deckDescription}
						onChange={(event) => onDeckDescriptionChange(event.target.value)}
						rows={3}
						placeholder="Optional short description for this deck"
						disabled={interactionDisabled}
					/>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{!deck ? (
						<Button className="gap-2" onClick={() => void onCreateDeck()} disabled={interactionDisabled}>
							<Sparkles className="size-4" />
							{deckSubmitting ? "Creating..." : "Create Admin Deck"}
						</Button>
					) : (
						<Button
							onClick={() => void onUpdateDeck()}
							disabled={interactionDisabled || !deckMetaDirty}
						>
							{deckSubmitting ? "Saving..." : "Save Deck Details"}
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
