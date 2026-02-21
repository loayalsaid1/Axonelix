import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { lessons } from '../../../database/entities/lessons';
import { chapters } from '../../../database/entities/chapters';
import { eq, ilike } from 'drizzle-orm';

@Injectable()
export class LessonsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createLessonDto: CreateLessonDto) {
    // Chapter must be provided by controller or caller
    if (!createLessonDto.chapterId) {
      throw new BadRequestException('chapterId is required');
    }

    // Verify that the chapter exists
    const chapter = await this.drizzleService.db.query.chapters.findFirst({
      where: eq(chapters.id, createLessonDto.chapterId),
    });

    if (!chapter) {
      throw new BadRequestException(`Chapter with ID ${createLessonDto.chapterId} not found`);
    }

    // Prepare payload only with lesson columns
    const payload: typeof lessons.$inferInsert = {
      chapterId: createLessonDto.chapterId,
      name: createLessonDto.name,
      description: createLessonDto.description,
      content: createLessonDto.content,
      orderIndex: createLessonDto.orderIndex,
    };

    const [newLesson] = await this.drizzleService.db
      .insert(lessons)
      .values(payload)
      .returning();

    return newLesson;
  }

  async findAll(chapterId?: number) {
    return await this.drizzleService.db.query.lessons.findMany({
      where: chapterId ? eq(lessons.chapterId, chapterId) : undefined,
      orderBy: (lessons, { asc }) => [asc(lessons.orderIndex), asc(lessons.name)],
      with: {
        chapter: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const lesson = await this.drizzleService.db.query.lessons.findFirst({
      where: eq(lessons.id, id),
      with: {
        chapter: {
          columns: {
            id: true,
            name: true,
          },
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
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async findQuestions(id: number) {
    const lesson = await this.drizzleService.db.query.lessons.findFirst({
      where: eq(lessons.id, id),
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.createdAt)],
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson.questions;
  }

  async search(query: string) {
    return await this.drizzleService.db.query.lessons.findMany({
      where: ilike(lessons.name, `%${query}%`),
      orderBy: (lessons, { asc }) => [asc(lessons.name)],
      limit: 20,
      with: {
        chapter: {
          columns: { id: true, name: true },
          with: {
            subject: {
              columns: { id: true, name: true, type: true },
              with: {
                module: { columns: { id: true, name: true } },
              },
            },
          },
        },
      },
    });
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    const [updatedLesson] = await this.drizzleService.db
      .update(lessons)
      .set(updateLessonDto)
      .where(eq(lessons.id, id))
      .returning();

    if (!updatedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return updatedLesson;
  }

  async remove(id: number) {
    const [deletedLesson] = await this.drizzleService.db
      .delete(lessons)
      .where(eq(lessons.id, id))
      .returning();

    if (!deletedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return deletedLesson;
  }
}
