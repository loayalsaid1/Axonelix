import { Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { users } from '../../database/entities/users';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRecord } from './interfaces/user-record.interface';
import { Role } from '../../common/enums';

export interface UserFilters {
  role?: Role;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) { }

  async findAll(
    filters?: UserFilters,
    pagination?: PaginationParams,
  ): Promise<PaginatedResult<UserRecord>> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const offset = (page - 1) * limit;

    const [data, [{ total }]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(users)
        .where(where)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ total: count() })
        .from(users)
        .where(where),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(dto: CreateUserDto): Promise<UserRecord> {
    const [newUser] = await this.drizzleService.db
      .insert(users)
      .values({
        clerkId: dto.clerkId,
        email: dto.email,
        role: dto.role ?? 'student',
      })
      .returning();

    return newUser;
  }

  /**
   * Insert the user if they don't exist yet; otherwise return the existing one.
   * Used as a fallback when the Clerk webhook hasn't fired yet.
   */
  async upsert(dto: CreateUserDto): Promise<UserRecord> {
    const existing = await this.findByClerkId(dto.clerkId);
    if (existing) return existing;
    return this.create(dto);
  }

  async findByClerkId(clerkId: string): Promise<UserRecord | null> {
    const user = await this.drizzleService.db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    return user ?? null;
  }

  async findById(id: number): Promise<UserRecord> {
    const user = await this.drizzleService.db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async updateByClerkId(
    clerkId: string,
    dto: UpdateUserDto,
  ): Promise<UserRecord> {
    const existing = await this.findByClerkId(clerkId);
    if (!existing) {
      throw new NotFoundException(`User with clerk id ${clerkId} not found`);
    }

    const [updated] = await this.drizzleService.db
      .update(users)
      .set({ ...dto, updatedAt: new Date().toISOString() })
      .where(eq(users.clerkId, clerkId))
      .returning();

    return updated;
  }

  async deleteByClerkId(clerkId: string): Promise<void> {
    await this.drizzleService.db
      .delete(users)
      .where(eq(users.clerkId, clerkId));
  }
}
