import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { UsersService, UserFilters } from './users.service';
import { AdminUserProfileDto } from './dto/admin-user-profile.dto';
import { Role } from '../../common/enums';

@Injectable()
export class AdminUsersService {
  private readonly clerkClient: ReturnType<typeof createClerkClient>;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    const secretKey = this.configService.getOrThrow<string>('CLERK_SECRET_KEY');
    this.clerkClient = createClerkClient({ secretKey });
  }

  async findAllWithProfile(filters?: UserFilters): Promise<AdminUserProfileDto[]> {
    const dbUsers = await this.usersService.findAll(filters);
    if (dbUsers.length === 0) return [];

    const { data: clerkUsers } = await this.clerkClient.users.getUserList({
      userId: dbUsers.map((u) => u.clerkId),
      limit: dbUsers.length,
    });

    const clerkMap = new Map(clerkUsers.map((u) => [u.id, u]));

    return dbUsers.map((dbUser) => {
      const clerkUser = clerkMap.get(dbUser.clerkId);
      return {
        id: dbUser.id,
        clerkId: dbUser.clerkId,
        email: dbUser.email,
        role: dbUser.role,
        createdAt: dbUser.createdAt,
        firstName: clerkUser?.firstName ?? null,
        lastName: clerkUser?.lastName ?? null,
        imageUrl: clerkUser?.imageUrl ?? null,
        lastSignInAt: clerkUser?.lastSignInAt
          ? new Date(clerkUser.lastSignInAt)
          : null,
      };
    });
  }

  findStudents(): Promise<AdminUserProfileDto[]> {
    return this.findAllWithProfile({ role: Role.Student });
  }
}
