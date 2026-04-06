import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { flashcards } from '../../../database/entities/flashcards';

export type CreateFlashcard = typeof flashcards.$inferInsert;


export class CreateCardDto implements Omit<CreateFlashcard, 'id' | 'deckId' | 'createdAt' | 'updatedAt'> {
	@IsString()
	@IsNotEmpty()
	front: CreateFlashcard['front'];

	@IsString()
	@IsNotEmpty()
	back: CreateFlashcard['back'];

	@IsNumber()
	@IsOptional()
	order?: CreateFlashcard['order'];
}

export class CreateCardsDto {
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(100)
	@ValidateNested({ each: true })
	@Type(() => CreateCardDto)
	cards: CreateCardDto[];
}
