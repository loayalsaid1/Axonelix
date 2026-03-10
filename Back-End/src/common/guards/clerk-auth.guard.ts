import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { UserRecord } from '../../modules/users/interfaces/user-record.interface';
import { IS_PUBLIC_KEY } from '../decorators/is-public.decorator';

/** Extend express Request so TypeScript knows about the attached user */
export interface AuthenticatedRequest extends Request {
  user: UserRecord;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const token = this.extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    // Verify JWT (networkless after initial JWKS cache warm-up)
    const payload = await this.authService.verifyClerkToken(token);
    const clerkId = payload.sub;

    if (!clerkId) {
      throw new UnauthorizedException('Token is missing subject claim');
    }

    // Attach the database user to the request
    (request as AuthenticatedRequest).user = await this.authService.getOrCreateUser(clerkId);

    return true;
  }

  private extractBearerToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.slice(7);
  }
}
