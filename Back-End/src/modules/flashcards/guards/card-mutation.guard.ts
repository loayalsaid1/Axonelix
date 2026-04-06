import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CardsService } from '../cards.service';
import { DecksService } from '../decks.service';
import { DeckType } from '../../../database/entities/enums/flashcard-enums';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

@Injectable()
export class CardMutationGuard implements CanActivate {
	constructor(
		private readonly cardsService: CardsService,
		private readonly decksService: DecksService
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user as UserRecord;

		if (!user) {
			throw new UnauthorizedException('User not authenticated.');
		}

		// `id` is the card's ID in the route params (e.g., /cards/:id)
		const targetCardId = request.params.id;

		if (!targetCardId) {
			return true;
		}

		const parsedCardId = parseInt(targetCardId);
		if (isNaN(parsedCardId)) {
			return true;
		}

		const card = await this.cardsService.findOne(parsedCardId);
		const deck = await this.decksService.findOne(card.deckId);

		const isOwner = deck.deckType === DeckType.PERSONAL && deck.userId === user.id;
		const isAdmin = user.role === 'admin';

		if (deck.deckType === DeckType.ADMIN && !isAdmin) {
			throw new ForbiddenException('Only admins can modify admin decks.');
		}

		if (deck.deckType === DeckType.PERSONAL && !isOwner) {
			throw new NotFoundException('Card not found');
		}

		return true;
	}
}
