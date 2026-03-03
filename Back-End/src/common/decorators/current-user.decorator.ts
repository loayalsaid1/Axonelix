import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../guards/clerk-auth.guard';
import { UserRecord } from '../../modules/users/interfaces/user-record.interface';

/**
 * Parameter decorator that extracts the authenticated user from the request.
 *
 * @example
 * \@Get('me')
 * \@UseGuards(ClerkAuthGuard)
 * getProfile(\@CurrentUser() user: UserRecord) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserRecord => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
