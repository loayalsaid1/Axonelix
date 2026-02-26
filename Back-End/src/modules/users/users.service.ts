import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { users } from '../../database/entities/users';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRecord } from './interfaces/user-record.interface';

@Injectable()
export class UsersService {
  constructor(private readonly drizzleService: DrizzleService) {}

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
