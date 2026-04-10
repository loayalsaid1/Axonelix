import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { UsersService, UserFilters, PaginationParams, PaginatedResult } from './users.service';
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

  async findAllWithProfile(
    filters?: UserFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<AdminUserProfileDto>> {
    const { data: dbUsers, ...meta } = await this.usersService.findAll(filters, pagination);

    if (dbUsers.length === 0) {
      return { data: [], ...meta };
    }

    const { data: clerkUsers } = await this.clerkClient.users.getUserList({
      userId: dbUsers.map((u) => u.clerkId),
      limit: dbUsers.length,
    });

    const clerkMap = new Map(clerkUsers.map((u) => [u.id, u]));

    const data = dbUsers.map((dbUser) => {
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
        lastSignInAt: clerkUser?.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,
      };
    });

    return { data, ...meta };
  }

  findStudents(pagination?: PaginationParams): Promise<PaginatedResult<AdminUserProfileDto>> {
    return this.findAllWithProfile({ role: Role.Student }, pagination);
  }

  async findByIdWithProfile(id: number): Promise<AdminUserProfileDto> {
    const dbUser = await this.usersService.findById(id);

    let clerkUser: Awaited<ReturnType<typeof this.clerkClient.users.getUser>> | null = null;
    try {
      clerkUser = await this.clerkClient.users.getUser(dbUser.clerkId);
    } catch (err: any) {
      if (err?.status !== 404) throw err;
    }

    return {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
      firstName: clerkUser?.firstName ?? null,
      lastName: clerkUser?.lastName ?? null,
      imageUrl: clerkUser?.imageUrl ?? null,
      lastSignInAt: clerkUser?.lastSignInAt ? new Date(clerkUser.lastSignInAt) : null,
    };
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.usersService.findById(id);
    try {
      await this.clerkClient.users.deleteUser(user.clerkId);
    } catch (err: any) {
      // If Clerk doesn't know about this user (e.g. test/seed data), proceed anyway
      if (err?.status !== 404) throw err;
    }
    await this.usersService.deleteByClerkId(user.clerkId);
  }

  async bulkDeleteUsers(ids: number[]): Promise<void> {
    await Promise.all(ids.map((id) => this.deleteUser(id)));
  }
}
