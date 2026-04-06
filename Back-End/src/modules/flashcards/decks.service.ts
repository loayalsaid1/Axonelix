import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { eq, and, or } from 'drizzle-orm';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { flashcardDecks, FlashcardDeck } from '../../database/entities/flashcard-decks';
import { DrizzleService } from '../../database/drizzle.service';
import { DeckType } from '../../database/entities/enums/flashcard-enums';

@Injectable()
export class DecksService {
	constructor(private readonly drizzleService: DrizzleService) { }

	private get db() {
		return this.drizzleService.db;
	}

	async create(createDeckDto: CreateDeckDto, userId: number): Promise<FlashcardDeck> {
		const { lessonId, deckType, name, description } = createDeckDto;

		// For PERSONAL decks, userId must be present.
		const deckUserId = deckType === DeckType.PERSONAL ? userId : null;

		try {
			const [newDeck] = await this.db
				.insert(flashcardDecks)
				.values({
					lessonId,
					deckType,
					name,
					description,
					userId: deckUserId,
				})
				.returning();

			return newDeck;
		} catch (error) {
			if (error.code === '23505') { // Unique violation in postgres
				throw new ConflictException(`A ${deckType} deck already exists for this lesson.`);
			}
			throw error;
		}
	}

	async findAllForLesson(lessonId: number, type?: DeckType, userId?: number): Promise<FlashcardDeck[]> {
		const filters = [eq(flashcardDecks.lessonId, lessonId)];

		if (type === DeckType.ADMIN) {
			filters.push(eq(flashcardDecks.deckType, type));
		} else if (type === DeckType.PERSONAL && userId) {
			filters.push(eq(flashcardDecks.deckType, type));
			filters.push(eq(flashcardDecks.userId, userId));
		} else if (userId) { // default: fetch ADMIN and user's PERSONAL
			const orCondition = or(
				eq(flashcardDecks.deckType, DeckType.ADMIN),
				and(eq(flashcardDecks.deckType, DeckType.PERSONAL), eq(flashcardDecks.userId, userId))
			);
			if (orCondition) {
				filters.push(orCondition);
			}
		}

		const allDecks = await this.db
			.select()
			.from(flashcardDecks)
			.where(and(...filters));

		return allDecks;
	}

	async findOne(id: number): Promise<FlashcardDeck> {
		const [deck] = await this.db
			.select()
			.from(flashcardDecks)
			.where(eq(flashcardDecks.id, id));


		if (!deck) {
			throw new NotFoundException('Deck not found');
		}

		return deck;
	}

	async update(id: number, updateDeckDto: UpdateDeckDto): Promise<FlashcardDeck> {
		const deck = await this.findOne(id);

		const [updatedDeck] = await this.db
			.update(flashcardDecks)
			.set({
				...updateDeckDto,
			})
			.where(eq(flashcardDecks.id, id))
			.returning();

		return updatedDeck;
	}

	async remove(id: number): Promise<{ success: boolean }> {
		const deck = await this.findOne(id);

		await this.db
			.delete(flashcardDecks)
			.where(eq(flashcardDecks.id, id));

		return { success: true };
	}
}
