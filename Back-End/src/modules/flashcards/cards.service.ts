import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { CreateCardsDto } from './dto/create-cards.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateCardsOrderDto } from './dto/update-cards-order.dto';
import { flashcards, Flashcard } from '../../database/entities/flashcards';
import { FlashcardDeck } from '../../database/entities/flashcard-decks';
import { DrizzleService } from '../../database/drizzle.service';
import { DecksService } from './decks.service';

@Injectable()
export class CardsService {
	constructor(private readonly drizzleService: DrizzleService, private readonly decksService: DecksService) { }

	private get db() {
		return this.drizzleService.db;
	}

	async createMany(deckId: number, createCardsDto: CreateCardsDto): Promise<Flashcard[]> {
		const deck = await this.decksService.findOne(deckId);

		const { cards } = createCardsDto;

		const valuesToInsert = cards.map(c => ({
			deckId,
			front: c.front,
			back: c.back,
			order: c.order || 0,
		}));

		const newCards = await this.db
			.insert(flashcards)
			.values(valuesToInsert)
			.returning();

		return newCards;
	}

	async findAllForDeck(deckId: number): Promise<{ deck: FlashcardDeck; cards: Flashcard[] }> {
		// Execute both database queries in parallel for better performance
		const [deck, cards] = await Promise.all([
			this.decksService.findOne(deckId),
			this.db
				.select()
				.from(flashcards)
				.where(eq(flashcards.deckId, deckId))
				.orderBy(flashcards.order),
		]);

		return { deck, cards };
	}

	async findOne(id: number): Promise<Flashcard> {
		const [card] = await this.db
			.select()
			.from(flashcards)
			.where(eq(flashcards.id, id));

		if (!card) {
			throw new NotFoundException('Card not found');
		}

		// Ensures deck exists and doesn't get orphan fetched
		await this.decksService.findOne(card.deckId);

		return card;
	}

	async update(id: number, updateCardDto: UpdateCardDto): Promise<Flashcard> {
		const card = await this.findOne(id);

		const [updatedCard] = await this.db
			.update(flashcards)
			.set({
				...updateCardDto,
				updatedAt: new Date(),
			})
			.where(eq(flashcards.id, id))
			.returning();

		return updatedCard;
	}

	async updateOrder(deckId: number, updateCardsOrderDto: UpdateCardsOrderDto): Promise<{ success: boolean }> {
		const deck = await this.decksService.findOne(deckId);

		const { cardIds } = updateCardsOrderDto;

		return this.db.transaction(async (tx) => {
			const updatePromises = cardIds.map((id, index) =>
				tx.update(flashcards)
					.set({ order: index })
					.where(and(
						eq(flashcards.id, id),
						eq(flashcards.deckId, deckId)
					))
			);

			await Promise.all(updatePromises);
			return { success: true };
		});
	}

	async remove(id: number): Promise<{ success: boolean }> {
		const card = await this.findOne(id);

		await this.db
			.delete(flashcards)
			.where(eq(flashcards.id, id));

		return { success: true };
	}
}
