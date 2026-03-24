import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, ParseIntPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CreateCardsDto } from './dto/create-cards.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { UpdateCardsOrderDto } from './dto/update-cards-order.dto';
import { Flashcard } from '../../database/entities/flashcards';
import { FlashcardDeck } from '../../database/entities/flashcard-decks';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { DeckMutationGuard } from './guards/deck-mutation.guard';
import { CardMutationGuard } from './guards/card-mutation.guard';

@Controller('flashcards')
export class CardsController {
	constructor(private readonly cardsService: CardsService) { }

	@Post('decks/:deckId/cards')
	@UseGuards(DeckMutationGuard)
	createMany(
		@Param('deckId', ParseIntPipe) deckId: number,
		@Body() createCardsDto: CreateCardsDto
	): Promise<Flashcard[]> {
		return this.cardsService.createMany(deckId, createCardsDto);
	}

	@Get('decks/:deckId/cards')
	@UseGuards(DeckMutationGuard)
	findAllForDeck(@Param('deckId', ParseIntPipe) deckId: number): Promise<{ deck: FlashcardDeck; cards: Flashcard[] }> {
		return this.cardsService.findAllForDeck(deckId);
	}

	@Put('decks/:deckId/cards/order')
	@UseGuards(DeckMutationGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	updateOrder(
		@Param('deckId', ParseIntPipe) deckId: number,
		@Body() updateCardsOrderDto: UpdateCardsOrderDto
	): undefined {
		this.cardsService.updateOrder(deckId, updateCardsOrderDto);
		return;
	}

	@Get('cards/:id')
	@UseGuards(CardMutationGuard)
	findOne(@Param('id', ParseIntPipe) id: number): Promise<Flashcard> {
		return this.cardsService.findOne(id);
	}

	@Patch('cards/:id')
	@UseGuards(CardMutationGuard)
	update(@Param('id', ParseIntPipe) id: number, @Body() updateCardDto: UpdateCardDto): Promise<Flashcard> {
		return this.cardsService.update(id, updateCardDto);
	}

	@Delete('cards/:id')
	@UseGuards(CardMutationGuard)
	remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
		return this.cardsService.remove(id);
	}
}
