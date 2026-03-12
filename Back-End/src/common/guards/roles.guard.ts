import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from './clerk-auth.guard';

/**
 * Must be applied after ClerkAuthGuard (which populates request.user).
 * Denies access with 403 if the authenticated user's role is not in
 * the @Roles() metadata declared on the handler or controller.
 */
@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) { }

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride(Roles, [
			context.getHandler(),
			context.getClass(),
		]);

		// No @Roles() decorator → route is accessible to any authenticated user
		if (!requiredRoles || requiredRoles.length === 0) {
			return true;
		}

		const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException('Insufficient permissions');
		}

		return true;
	}
}
