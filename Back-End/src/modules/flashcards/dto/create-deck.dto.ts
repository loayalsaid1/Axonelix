import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { flashcardDecks } from '../../../database/entities/flashcard-decks';
import { DeckType } from '../../../database/entities/enums/flashcard-enums';

export type CreateDeck = typeof flashcardDecks.$inferInsert;

export class CreateDeckDto implements Omit<CreateDeck, 'id' | 'userId' | 'cardCount' | 'createdAt' | 'updatedAt'> {
	@IsNumber()
	@IsNotEmpty()
	lessonId: CreateDeck['lessonId'];

	@IsEnum(DeckType)
	@IsNotEmpty()
	deckType: CreateDeck['deckType'];

	@IsString()
	@IsNotEmpty()
	name: CreateDeck['name'];

	@IsString()
	@IsOptional()
	description?: CreateDeck['description'];
}
