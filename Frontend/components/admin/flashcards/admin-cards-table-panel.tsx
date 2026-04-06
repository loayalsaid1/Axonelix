import { ArrowDown, ArrowUp, GripVertical, Pencil, Save, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminEmptyState } from "@/components/admin/shared/admin-empty-state";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { type Flashcard } from "@/lib/types/flashcards";

interface AdminCardsTablePanelProps {
	cards: Flashcard[];
	orderDirty: boolean;
	isMutating: boolean;
	isSavingOrder: boolean;
	onCreateCard: () => void;
	onEditCard: (card: Flashcard) => void;
	onDeleteCard: (card: Flashcard) => void;
	onMoveCard: (index: number, direction: "up" | "down") => void;
	onSaveOrder: () => Promise<void>;
	onDiscardOrderChanges: () => void | Promise<void>;
}

export function AdminCardsTablePanel({
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
}: AdminCardsTablePanelProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<CardTitle className="inline-flex items-center gap-2">
							<GripVertical className="size-4" />
							Manage Cards
						</CardTitle>
						<CardDescription>
							Edit card content, reorder cards, or remove cards from this deck.
						</CardDescription>
					</div>
					<Badge variant="secondary">{cards.length} cards</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{orderDirty ? (
					<div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-muted-foreground">
							You changed card order. Save to publish the new sequence.
						</p>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								className="gap-2"
								onClick={() => void onDiscardOrderChanges()}
								disabled={isSavingOrder}
							>
								<Undo2 className="size-4" />
								Discard
							</Button>
							<Button className="gap-2" onClick={() => void onSaveOrder()} disabled={isSavingOrder}>
								<Save className="size-4" />
								{isSavingOrder ? "Saving..." : "Save Order"}
							</Button>
						</div>
					</div>
				) : null}

				{cards.length === 0 ? (
					<AdminEmptyState
						title="No cards in this deck"
						description="Start by creating the first card. You can edit and reorder cards after creation."
						actionLabel="Create First Card"
						onAction={onCreateCard}
					/>
				) : (
					<div className="rounded-lg border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-20">Order</TableHead>
									<TableHead>Front</TableHead>
									<TableHead>Back</TableHead>
									<TableHead className="w-32 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{cards.map((card, index) => (
									<TableRow key={card.id}>
										<TableCell>
											<div className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-1 text-xs font-medium">
												{index + 1}
												<button
													type="button"
													className="rounded p-0.5 hover:bg-background disabled:opacity-50"
													aria-label="Move card up"
													onClick={() => onMoveCard(index, "up")}
													disabled={index === 0 || isSavingOrder || isMutating}
												>
													<ArrowUp className="size-3" />
												</button>
												<button
													type="button"
													className="rounded p-0.5 hover:bg-background disabled:opacity-50"
													aria-label="Move card down"
													onClick={() => onMoveCard(index, "down")}
													disabled={index === cards.length - 1 || isSavingOrder || isMutating}
												>
													<ArrowDown className="size-3" />
												</button>
											</div>
										</TableCell>
										<TableCell>
											<p className="line-clamp-2 text-sm leading-6">{card.front}</p>
										</TableCell>
										<TableCell>
											<p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{card.back}</p>
										</TableCell>
										<TableCell>
											<div className="flex items-center justify-end gap-1">
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => onEditCard(card)}
													disabled={isMutating || isSavingOrder}
												>
													<Pencil className="size-4" />
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => onDeleteCard(card)}
													disabled={isMutating || isSavingOrder}
												>
													<Trash2 className="size-4 text-destructive" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
