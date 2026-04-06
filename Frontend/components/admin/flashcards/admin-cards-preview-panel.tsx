import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlashcardViewer } from "@/components/flashcards/FlashcardViewer";
import { type Flashcard } from "@/lib/types/flashcards";

interface AdminCardsPreviewPanelProps {
	cards: Flashcard[];
	isDisabled: boolean;
	onAddCard: () => void;
}

export function AdminCardsPreviewPanel({ cards, isDisabled, onAddCard }: AdminCardsPreviewPanelProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle className="inline-flex items-center gap-2">
							<Layers className="size-4" />
							Deck Preview
						</CardTitle>
						<CardDescription>
							Preview cards exactly as students will review them in the lesson tab.
						</CardDescription>
					</div>
					<Button className="gap-2" onClick={onAddCard} disabled={isDisabled}>
						<Plus className="size-4" />
						Add Card
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<FlashcardViewer cards={cards} />
			</CardContent>
		</Card>
	);
}
