import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { CreateModuleDto, UpdateModuleDto } from './dto';
import { modules } from '../../../database/entities/modules';
import { eq } from 'drizzle-orm';
import { SubscriptionsAccessService } from '../../subscriptions/subscriptions-access.service';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

@Injectable()
export class ModulesService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly subscriptionsAccessService: SubscriptionsAccessService,
  ) { }

  async create(createModuleDto: CreateModuleDto) {
    const [newModule] = await this.drizzleService.db
      .insert(modules)
      .values(createModuleDto)
      .returning();

    return newModule;
  }

  async findNames(
    user?: UserRecord,
    includeAccess = false,
  ): Promise<Array<{ id: number; name: string; accessStatus?: 'owned' | 'locked' }>> {
    const rows = await this.drizzleService.db.query.modules.findMany({
      columns: { id: true, name: true },
      orderBy: (m, { asc }) => [asc(m.orderIndex), asc(m.name)],
    });

    if (!includeAccess) return rows;
    return this.withAccessStatus(rows, user);
  }

  async findAll(user?: UserRecord, includeAccess = false) {
    const rows = await this.drizzleService.db.query.modules.findMany({
      orderBy: (modules, { asc }) => [asc(modules.orderIndex), asc(modules.name)],
      with: {
        subjects: {
          orderBy: (subjects, { asc }) => [asc(subjects.orderIndex), asc(subjects.name)],
        },
      },
    });

    if (!includeAccess) return rows;
    return this.withAccessStatus(rows, user);
  }

  async findOne(id: number, user?: UserRecord, includeAccess = false) {
    const module = await this.drizzleService.db.query.modules.findFirst({
      where: eq(modules.id, id),
      with: {
        subjects: {
          orderBy: (subjects, { asc }) => [asc(subjects.orderIndex), asc(subjects.name)],
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    if (!includeAccess) return module;

    const [withStatus] = await this.withAccessStatus([module], user);
    return withStatus;
  }

  async findHierarchy(id: number, user?: UserRecord, includeAccess = false) {
    const module = await this.drizzleService.db.query.modules.findFirst({
      where: eq(modules.id, id),
      with: {
        subjects: {
          orderBy: (subjects, { asc }) => [asc(subjects.orderIndex), asc(subjects.name)],
          with: {
            chapters: {
              orderBy: (chapters, { asc }) => [asc(chapters.orderIndex), asc(chapters.name)],
              with: {
                lessons: {
                  orderBy: (lessons, { asc }) => [asc(lessons.orderIndex), asc(lessons.name)],
                },
              },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    if (!includeAccess) return module;

    const [withStatus] = await this.withAccessStatus([module], user);
    return withStatus;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto) {
    const [updatedModule] = await this.drizzleService.db
      .update(modules)
      .set(updateModuleDto)
      .where(eq(modules.id, id))
      .returning();

    if (!updatedModule) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return updatedModule;
  }

  async remove(id: number) {
    const [deletedModule] = await this.drizzleService.db
      .delete(modules)
      .where(eq(modules.id, id))
      .returning();

    if (!deletedModule) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return deletedModule;
  }

  private async withAccessStatus<T extends { id: number }>(
    rows: T[],
    user?: UserRecord,
  ): Promise<Array<T & { accessStatus: 'owned' | 'locked' }>> {
    if (!rows.length) return [];

    if (!user || this.subscriptionsAccessService.isAdmin(user)) {
      return rows.map((row) => ({ ...row, accessStatus: 'owned' }));
    }

    const ownedIds = new Set(
      await this.subscriptionsAccessService.getOwnedModuleIds(user.id),
    );

    return rows.map((row) => ({
      ...row,
      accessStatus: ownedIds.has(row.id) ? 'owned' : 'locked',
    }));
  }
}
