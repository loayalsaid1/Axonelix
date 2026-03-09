import {
  Injectable,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { UsersService } from '../users/users.service';
import { UserRecord } from '../users/interfaces/user-record.interface';

type ClerkJwtPayload = Awaited<ReturnType<typeof verifyToken>>;

const USER_CACHE_PREFIX = 'auth:user:';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly clerkSecretKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const key = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!key) {
      throw new Error('CLERK_SECRET_KEY environment variable is not set');
    }
    this.clerkSecretKey = key;
  }

  /**
   * Verify a Clerk session token without making a per-request network call.
   * Clerk's `verifyToken` caches the JWKS after the very first fetch, so all
   * subsequent verifications are fully local (RS256 signature check only).
   */
  async verifyClerkToken(token: string): Promise<ClerkJwtPayload> {
    try {
      return await verifyToken(token, { secretKey: this.clerkSecretKey });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Retrieve the application user by their Clerk ID.
   * Checks the in-memory cache first; on a miss it queries the DB (or falls
   * back to the Clerk API for auto-creation) and stores the result.
   */
  async getOrCreateUser(clerkId: string): Promise<UserRecord> {
    const cacheKey = `${USER_CACHE_PREFIX}${clerkId}`;
    const cached = await this.cacheManager.get<UserRecord>(cacheKey);
    if (cached) return cached;

    const user = await this.resolveUser(clerkId);
    await this.cacheManager.set(cacheKey, user);
    return user;
  }

  /** Internal: fetch from DB or fall back to Clerk API and auto-create. */
  private async resolveUser(clerkId: string): Promise<UserRecord> {
    const existing = await this.usersService.findByClerkId(clerkId);
    if (existing) return existing;

    this.logger.warn(
      `User ${clerkId} not found in DB — falling back to Clerk API`,
    );

    const clerkClient = createClerkClient({ secretKey: this.clerkSecretKey });
    const clerkUser = await clerkClient.users.getUser(clerkId);

    const primaryEmail =
      clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw new UnauthorizedException(
        'Cannot resolve email address for this user',
      );
    }

    return this.usersService.upsert({ clerkId, email: primaryEmail });
  }
}
