import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { StatsService } from './stats.service';
import { UserDashboardStatsDto } from './dto/stats-response.dto';

@Controller('users/me/stats')
export class MyStatsController {
	constructor(private readonly statsService: StatsService) { }

	/**
	 * GET /users/me/stats
	 *
	 * Returns dashboard overview for the authenticated student:
	 * streak, average score, and total questions answered.
	 */
	@Get()
	getOverview(@CurrentUser() user: UserRecord): Promise<UserDashboardStatsDto> {
		return this.statsService.getStudentOverview(user.id);
	}
}
