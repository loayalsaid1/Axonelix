import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { CreateModuleDto, UpdateModuleDto } from './dto';
import { modules } from '../../../database/entities/modules';
import { eq } from 'drizzle-orm';

@Injectable()
export class ModulesService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createModuleDto: CreateModuleDto) {
    const [newModule] = await this.drizzleService.db
      .insert(modules)
      .values(createModuleDto)
      .returning();

    return newModule;
  }

  async findNames(): Promise<{ id: number; name: string }[]> {
    return this.drizzleService.db.query.modules.findMany({
      columns: { id: true, name: true },
      orderBy: (m, { asc }) => [asc(m.orderIndex), asc(m.name)],
    });
  }

  async findAll() {
    return await this.drizzleService.db.query.modules.findMany({
      orderBy: (modules, { asc }) => [asc(modules.orderIndex), asc(modules.name)],
      with: {
        subjects: {
          orderBy: (subjects, { asc }) => [asc(subjects.orderIndex), asc(subjects.name)],
        },
      },
    });
  }

  async findOne(id: number) {
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

    return module;
  }

  async findHierarchy(id: number) {
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

    return module;
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
}
