import { Controller, Get } from '@nestjs/common';
import { StreaksService } from './streaks.service';
import { StreakResponseDto, StreakNotStartedDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import type { UserRecord } from '../users/interfaces/user-record.interface';

@Controller('streaks')
export class StreaksController {
	constructor(private readonly streaksService: StreaksService) { }

	/** Returns the authenticated user's current streak data. */
	@Get('current')
	getMyStreak(@CurrentUser() user: UserRecord): Promise<StreakResponseDto | StreakNotStartedDto> {
		return this.streaksService.getStreak(user.id);
	}
}
