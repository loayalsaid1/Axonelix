import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DecksService } from '../decks.service';
import { DeckType } from '../../../database/entities/enums/flashcard-enums';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

@Injectable()
export class DeckMutationGuard implements CanActivate {
	constructor(private readonly decksService: DecksService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user as UserRecord;

		if (!user) {
			throw new UnauthorizedException('User not authenticated.');
		}

		// Support both `id` (e.g., /decks/:id) and `deckId` (e.g., /decks/:deckId/cards)
		const targetDeckId = request.params.deckId || request.params.id;

		if (!targetDeckId) {
			return true; // No deck to check, allow.
		}

		const parsedDeckId = parseInt(targetDeckId);
		if (isNaN(parsedDeckId)) {
			return true;
		}

		const deck = await this.decksService.findOne(parsedDeckId);

		const isOwner = deck.deckType === DeckType.PERSONAL && deck.userId === user.id;
		const isAdmin = user.role === 'admin';

		if (deck.deckType === DeckType.ADMIN && !isAdmin) {
			throw new UnauthorizedException('Only admins can modify admin decks.');
		}

		if (deck.deckType === DeckType.PERSONAL && !isOwner) {
			// Return NotFound to hide existence from unauthorized users
			throw new NotFoundException('Deck not found');
		}

		return true;
	}
}
