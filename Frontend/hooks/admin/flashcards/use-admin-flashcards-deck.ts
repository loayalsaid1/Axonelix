import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Flashcard, type FlashcardDeck } from "@/lib/types/flashcards";
import { type FlashcardFormValues } from "@/components/admin/flashcards/flashcard-form-dialog";
import { type useApiFetch } from "@/hooks/use-api-fetch";
import {
	type LessonDetailsResponse,
	type SelectedLessonPath,
} from "@/lib/types/admin-flashcards.types";

type AuthFetch = ReturnType<typeof useApiFetch>;

function sortCards(cards: Flashcard[]): Flashcard[] {
	return [...cards].sort((a, b) => {
		if (a.order === b.order) {
			return a.id - b.id;
		}
		return a.order - b.order;
	});
}

interface UseAdminFlashcardsDeckResult {
	selectedLessonDetails: LessonDetailsResponse | null;
	selectedPath: SelectedLessonPath | null;
	deck: FlashcardDeck | null;
	cards: Flashcard[];
	deckName: string;
	deckDescription: string;
	deckLoading: boolean;
	deckSubmitting: boolean;
	cardMutating: boolean;
	orderDirty: boolean;
	orderSaving: boolean;
	deckMetaDirty: boolean;
	setDeckName: (value: string) => void;
	setDeckDescription: (value: string) => void;
	resetDeckContext: () => void;
	createDeck: () => Promise<void>;
	updateDeck: () => Promise<void>;
	handleCreateCard: (values: FlashcardFormValues) => Promise<void>;
	handleEditCard: (cardId: number, values: FlashcardFormValues) => Promise<void>;
	handleDeleteCard: (cardId: number) => Promise<void>;
	handleMoveCard: (index: number, direction: "up" | "down") => void;
	handleSaveOrder: () => Promise<void>;
	handleDiscardOrderChanges: () => Promise<void>;
}

export function useAdminFlashcardsDeck(
	authFetch: AuthFetch,
	selectedLessonId: number | null,
): UseAdminFlashcardsDeckResult {
	const [selectedLessonDetails, setSelectedLessonDetails] = useState<LessonDetailsResponse | null>(null);
	const [deck, setDeck] = useState<FlashcardDeck | null>(null);
	const [cards, setCards] = useState<Flashcard[]>([]);

	const [deckName, setDeckName] = useState("");
	const [deckDescription, setDeckDescription] = useState("");

	const [deckLoading, setDeckLoading] = useState(false);
	const [deckSubmitting, setDeckSubmitting] = useState(false);
	const [cardMutating, setCardMutating] = useState(false);
	const [orderDirty, setOrderDirty] = useState(false);
	const [orderSaving, setOrderSaving] = useState(false);

	const loadDeckForLesson = useCallback(
		async (lessonId: number): Promise<FlashcardDeck | null> => {
			const decks = await authFetch<FlashcardDeck[]>(`/flashcards/decks?lessonId=${lessonId}&type=ADMIN`);
			const adminDeck = decks[0] ?? null;

			setDeck(adminDeck);
			setOrderDirty(false);

			if (!adminDeck) {
				setCards([]);
				return null;
			}

			const deckCards = await authFetch<{ deck: FlashcardDeck; cards: Flashcard[] }>(
				`/flashcards/decks/${adminDeck.id}/cards`,
			);
			setCards(sortCards(deckCards.cards ?? []));
			return adminDeck;
		},
		[authFetch],
	);

	const resetDeckContext = useCallback(() => {
		setSelectedLessonDetails(null);
		setDeck(null);
		setCards([]);
		setDeckName("");
		setDeckDescription("");
		setOrderDirty(false);
	}, []);

	useEffect(() => {
		if (!selectedLessonId) {
			resetDeckContext();
			return;
		}

		let active = true;
		setDeckLoading(true);

		Promise.all([
			authFetch<LessonDetailsResponse>(`/materials/lessons/${selectedLessonId}`),
			loadDeckForLesson(selectedLessonId),
		])
			.then(([lessonDetails, adminDeck]) => {
				if (!active) {
					return;
				}

				setSelectedLessonDetails(lessonDetails);

				if (adminDeck) {
					setDeckName(adminDeck.name);
					setDeckDescription(adminDeck.description ?? "");
				} else {
					setDeckName(`${lessonDetails.name} - Axonelix Deck`);
					setDeckDescription("");
				}
			})
			.catch((error) => {
				console.error("Failed to load flashcards context:", error);
				toast.error("Failed to load lesson flashcards data.");
			})
			.finally(() => {
				if (active) {
					setDeckLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [authFetch, loadDeckForLesson, resetDeckContext, selectedLessonId]);

	const selectedPath = useMemo<SelectedLessonPath | null>(() => {
		if (!selectedLessonDetails) {
			return null;
		}

		return {
			module: selectedLessonDetails.chapter.subject.module,
			subject: selectedLessonDetails.chapter.subject,
			chapter: selectedLessonDetails.chapter,
			lesson: {
				id: selectedLessonDetails.id,
				name: selectedLessonDetails.name,
			},
		};
	}, [selectedLessonDetails]);

	const deckMetaDirty = useMemo(() => {
		if (!deck) {
			return !!deckName.trim() || !!deckDescription.trim();
		}

		return deckName.trim() !== deck.name || deckDescription.trim() !== (deck.description ?? "");
	}, [deck, deckDescription, deckName]);

	async function createDeck() {
		if (!selectedLessonId) {
			toast.error("Select a lesson first.");
			return;
		}

		if (!deckName.trim()) {
			toast.error("Deck name is required.");
			return;
		}

		try {
			setDeckSubmitting(true);
			const createdDeck = await authFetch<FlashcardDeck>("/flashcards/decks", {
				method: "POST",
				body: {
					lessonId: selectedLessonId,
					deckType: "ADMIN",
					name: deckName.trim(),
					description: deckDescription.trim() || undefined,
				},
			});

			setDeck(createdDeck);
			setDeckName(createdDeck.name);
			setDeckDescription(createdDeck.description ?? "");
			setCards([]);

			toast.success("Admin deck created.");
		} catch (error) {
			console.error("Failed to create deck:", error);
			toast.error(error instanceof Error ? error.message : "Failed to create deck.");
		} finally {
			setDeckSubmitting(false);
		}
	}

	async function updateDeck() {
		if (!deck) {
			return;
		}

		if (!deckName.trim()) {
			toast.error("Deck name is required.");
			return;
		}

		try {
			setDeckSubmitting(true);

			const updatedDeck = await authFetch<FlashcardDeck>(`/flashcards/decks/${deck.id}`, {
				method: "PATCH",
				body: {
					name: deckName.trim(),
					description: deckDescription.trim() || null,
				},
			});

			setDeck(updatedDeck);
			setDeckName(updatedDeck.name);
			setDeckDescription(updatedDeck.description ?? "");

			toast.success("Deck details updated.");
		} catch (error) {
			console.error("Failed to update deck:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update deck.");
		} finally {
			setDeckSubmitting(false);
		}
	}

	async function handleCreateCard(values: FlashcardFormValues) {
		if (!deck) {
			toast.error("Create the deck before adding cards.");
			return;
		}

		try {
			setCardMutating(true);
			const nextOrder = cards.reduce((maxOrder, card) => Math.max(maxOrder, card.order), -1) + 1;

			const newCards = await authFetch<Flashcard[]>(`/flashcards/decks/${deck.id}/cards`, {
				method: "POST",
				body: {
					cards: [
						{
							front: values.front,
							back: values.back,
							order: nextOrder,
						},
					],
				},
			});

			setCards((current) => sortCards([...current, ...(newCards ?? [])]));
			toast.success("Card created.");
		} catch (error) {
			console.error("Failed to create card:", error);
			toast.error(error instanceof Error ? error.message : "Failed to create card.");
		} finally {
			setCardMutating(false);
		}
	}

	async function handleEditCard(cardId: number, values: FlashcardFormValues) {
		try {
			setCardMutating(true);

			const updatedCard = await authFetch<Flashcard>(`/flashcards/cards/${cardId}`, {
				method: "PATCH",
				body: {
					front: values.front,
					back: values.back,
				},
			});

			setCards((current) =>
				current.map((card) => {
					if (card.id !== cardId) {
						return card;
					}
					return {
						...card,
						...updatedCard,
					};
				}),
			);

			toast.success("Card updated.");
		} catch (error) {
			console.error("Failed to update card:", error);
			toast.error(error instanceof Error ? error.message : "Failed to update card.");
			throw error;
		} finally {
			setCardMutating(false);
		}
	}

	async function handleDeleteCard(cardId: number) {
		try {
			setCardMutating(true);

			await authFetch(`/flashcards/cards/${cardId}`, {
				method: "DELETE",
			});

			setCards((current) => current.filter((card) => card.id !== cardId));
			toast.success("Card deleted.");
		} catch (error) {
			console.error("Failed to delete card:", error);
			toast.error(error instanceof Error ? error.message : "Failed to delete card.");
			throw error;
		} finally {
			setCardMutating(false);
		}
	}

	function handleMoveCard(index: number, direction: "up" | "down") {
		setCards((current) => {
			const targetIndex = direction === "up" ? index - 1 : index + 1;
			if (targetIndex < 0 || targetIndex >= current.length) {
				return current;
			}

			const reordered = [...current];
			[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

			return reordered.map((card, nextIndex) => ({
				...card,
				order: nextIndex,
			}));
		});

		setOrderDirty(true);
	}

	async function handleSaveOrder() {
		if (!deck) {
			return;
		}

		try {
			setOrderSaving(true);

			await authFetch(`/flashcards/decks/${deck.id}/cards/order`, {
				method: "PUT",
				body: {
					cardIds: cards.map((card) => card.id),
				},
			});

			setOrderDirty(false);
			toast.success("Card order updated.");
		} catch (error) {
			console.error("Failed to save order:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save order.");
		} finally {
			setOrderSaving(false);
		}
	}

	async function handleDiscardOrderChanges() {
		if (!selectedLessonId) {
			return;
		}

		try {
			setDeckLoading(true);
			await loadDeckForLesson(selectedLessonId);
			toast.success("Local order changes discarded.");
		} catch (error) {
			console.error("Failed to discard order changes:", error);
			toast.error(error instanceof Error ? error.message : "Failed to reload cards.");
		} finally {
			setDeckLoading(false);
		}
	}

	return {
		selectedLessonDetails,
		selectedPath,
		deck,
		cards,
		deckName,
		deckDescription,
		deckLoading,
		deckSubmitting,
		cardMutating,
		orderDirty,
		orderSaving,
		deckMetaDirty,
		setDeckName,
		setDeckDescription,
		resetDeckContext,
		createDeck,
		updateDeck,
		handleCreateCard,
		handleEditCard,
		handleDeleteCard,
		handleMoveCard,
		handleSaveOrder,
		handleDiscardOrderChanges,
	};
}
