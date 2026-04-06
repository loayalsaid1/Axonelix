import { Module } from '@nestjs/common';
import { DecksController } from './decks.controller';
import { DecksService } from './decks.service';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { DrizzleModule } from '../../database/drizzle.module';

@Module({
	imports: [DrizzleModule],
	controllers: [DecksController, CardsController],
	providers: [DecksService, CardsService],
	exports: [DecksService, CardsService],
})
export class FlashcardsModule { }
