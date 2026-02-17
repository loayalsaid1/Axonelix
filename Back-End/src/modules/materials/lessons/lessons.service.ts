import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { lessons } from '../../../database/entities/lessons';
import { chapters } from '../../../database/entities/chapters';
import { eq } from 'drizzle-orm';

@Injectable()
export class LessonsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(createLessonDto: CreateLessonDto) {
    // Verify that the chapter exists
    const chapter = await this.drizzleService.db.query.chapters.findFirst({
      where: eq(chapters.id, createLessonDto.chapterId),
    });

    if (!chapter) {
      throw new BadRequestException(`Chapter with ID ${createLessonDto.chapterId} not found`);
    }

    const [newLesson] = await this.drizzleService.db
      .insert(lessons)
      .values(createLessonDto)
      .returning();

    return newLesson;
  }

  async findAll(chapterId?: number) {
    return await this.drizzleService.db.query.lessons.findMany({
      where: chapterId ? eq(lessons.chapterId, chapterId) : undefined,
      orderBy: (lessons, { asc }) => [asc(lessons.orderIndex), asc(lessons.name)],
      with: {
        chapter: true,
      },
    });
  }

  async findOne(id: number) {
    const lesson = await this.drizzleService.db.query.lessons.findFirst({
      where: eq(lessons.id, id),
      with: {
        chapter: {
          with: {
            subject: {
              with: {
                module: true,
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
