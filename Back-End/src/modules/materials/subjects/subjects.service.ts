import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { subjects } from '../../../database/entities/subjects';
import { modules } from '../../../database/entities/modules';
import { eq } from 'drizzle-orm';

@Injectable()
export class SubjectsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    // Verify that the module exists
    const module = await this.drizzleService.db.query.modules.findFirst({
      where: eq(modules.id, createSubjectDto.moduleId),
    });

    if (!module) {
      throw new BadRequestException(`Module with ID ${createSubjectDto.moduleId} not found`);
    }

    const [newSubject] = await this.drizzleService.db
      .insert(subjects)
      .values(createSubjectDto)
      .returning();

    return newSubject;
  }

  async findAll(moduleId?: number) {
    return await this.drizzleService.db.query.subjects.findMany({
      where: moduleId ? eq(subjects.moduleId, moduleId) : undefined,
      orderBy: (subjects, { asc }) => [asc(subjects.orderIndex), asc(subjects.name)],
      with: {
        module: true,
        chapters: {
          orderBy: (chapters, { asc }) => [asc(chapters.orderIndex), asc(chapters.name)],
        },
      },
    });
  }

  async findOne(id: number) {
    const subject = await this.drizzleService.db.query.subjects.findFirst({
      where: eq(subjects.id, id),
      with: {
        module: true,
        chapters: {
          orderBy: (chapters, { asc }) => [asc(chapters.orderIndex), asc(chapters.name)],
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async findChapters(id: number) {
    const subject = await this.drizzleService.db.query.subjects.findFirst({
      where: eq(subjects.id, id),
      with: {
        chapters: {
          orderBy: (chapters, { asc }) => [asc(chapters.orderIndex), asc(chapters.name)],
        },
      },
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject.chapters;
  }

  async update(id: number, updateSubjectDto: UpdateSubjectDto) {
    const [updatedSubject] = await this.drizzleService.db
      .update(subjects)
      .set(updateSubjectDto)
      .where(eq(subjects.id, id))
      .returning();

    if (!updatedSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return updatedSubject;
  }

  async remove(id: number) {
    const [deletedSubject] = await this.drizzleService.db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning();

    if (!deletedSubject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return deletedSubject;
  }
}
