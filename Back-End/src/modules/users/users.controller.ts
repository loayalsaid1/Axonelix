import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators';
import type { UserRecord } from './interfaces/user-record.interface';

@Controller('users')
export class UsersController {
	/** Returns the currently authenticated user's database record. */
	@Get('me')
	getMe(@CurrentUser() user: UserRecord): UserRecord {
		return user;
	}
}
