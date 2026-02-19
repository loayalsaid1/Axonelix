import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { CreateChapterDto, UpdateChapterDto } from './dto';
import { chapters } from '../../../database/entities/chapters';
import { subjects } from '../../../database/entities/subjects';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ChaptersService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async getOrCreateMiscChapter(subjectId: number) {
    return await this.drizzleService.db.transaction(async (tx) => {
      const existing = await tx.query.chapters.findFirst({
        where: and(eq(chapters.subjectId, subjectId), eq(chapters.isMiscellaneous, true)),
      });

      if (existing) {
        return existing;
      }

      const [newChapter] = await tx.insert(chapters).values({
        subjectId,
        name: 'Misc',
        isMiscellaneous: true,
      }).returning();

      return newChapter;
    });
  }

  async create(createChapterDto: CreateChapterDto) {
    // Verify that the subject exists
    const subject = await this.drizzleService.db.query.subjects.findFirst({
      where: eq(subjects.id, createChapterDto.subjectId),
    });

    if (!subject) {
      throw new BadRequestException(`Subject with ID ${createChapterDto.subjectId} not found`);
    }

    const [newChapter] = await this.drizzleService.db
      .insert(chapters)
      .values(createChapterDto)
      .returning();

    return newChapter;
  }

  async findAll(subjectId?: number) {
    return await this.drizzleService.db.query.chapters.findMany({
      where: subjectId ? eq(chapters.subjectId, subjectId) : undefined,
      orderBy: (chapters, { asc }) => [asc(chapters.orderIndex), asc(chapters.name)],
      with: {
        subject: true,
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.orderIndex), asc(lessons.name)],
        },
      },
    });
  }

  async findOne(id: number) {
    const chapter = await this.drizzleService.db.query.chapters.findFirst({
      where: eq(chapters.id, id),
      with: {
        subject: {
          columns: {
            id: true,
            name: true,
            type: true,
          },
          with: {
            module: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.orderIndex), asc(lessons.name)],
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return chapter;
  }

  async findLessons(id: number) {
    const chapter = await this.drizzleService.db.query.chapters.findFirst({
      where: eq(chapters.id, id),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.orderIndex), asc(lessons.name)],
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return chapter.lessons;
  }

  async update(id: number, updateChapterDto: UpdateChapterDto) {
    const [updatedChapter] = await this.drizzleService.db
      .update(chapters)
      .set(updateChapterDto)
      .where(eq(chapters.id, id))
      .returning();

    if (!updatedChapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return updatedChapter;
  }

  async remove(id: number) {
    const [deletedChapter] = await this.drizzleService.db
      .delete(chapters)
      .where(eq(chapters.id, id))
      .returning();

    if (!deletedChapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    return deletedChapter;
  }
}
