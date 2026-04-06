import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { DecksService } from './decks.service';
import { CreateDeckDto } from './dto/create-deck.dto';
import { UpdateDeckDto } from './dto/update-deck.dto';
import { DeckType } from '../../database/entities/enums/flashcard-enums';
import { FlashcardDeck } from '../../database/entities/flashcard-decks';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { DeckMutationGuard } from './guards/deck-mutation.guard';

@Controller('flashcards/decks')
export class DecksController {
	constructor(private readonly decksService: DecksService) { }

	@Post()
	create(@Body() createDeckDto: CreateDeckDto, @CurrentUser() user: UserRecord): Promise<FlashcardDeck> {
		if (user.role !== 'admin' && createDeckDto.deckType === DeckType.ADMIN) {
			throw new ForbiddenException('Only admins can create admin decks.');
		}
		return this.decksService.create(createDeckDto, user.id);
	}

	@Get()
	findAll(
		@Query('lessonId', ParseIntPipe) lessonId: number,
		@Query('type') type: DeckType,
		@CurrentUser() user: UserRecord
	): Promise<FlashcardDeck[]> {
		return this.decksService.findAllForLesson(lessonId, type, user.id);
	}

	@Get(':id')
	@UseGuards(DeckMutationGuard)
	findOne(@Param('id', ParseIntPipe) id: number): Promise<FlashcardDeck> {
		return this.decksService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(DeckMutationGuard)
	update(@Param('id', ParseIntPipe) id: number, @Body() updateDeckDto: UpdateDeckDto): Promise<FlashcardDeck> {
		return this.decksService.update(id, updateDeckDto);
	}

	@Delete(':id')
	@UseGuards(DeckMutationGuard)
	remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
		return this.decksService.remove(id);
	}
}
