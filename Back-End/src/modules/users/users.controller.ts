import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators';
import type { UserRecord } from './interfaces/user-record.interface';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
	/** Returns the currently authenticated user's database record. */
	@Get('me')
	getMe(@CurrentUser() user: UserRecord): UserRecord {
		return user;
	}
}
