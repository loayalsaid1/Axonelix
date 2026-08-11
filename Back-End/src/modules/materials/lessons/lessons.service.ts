import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { ImagesService } from '../../images/images.service';
import { extractImageUrls } from '../../../common/utils/tiptap-utils';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { lessons } from '../../../database/entities/lessons';
import { chapters } from '../../../database/entities/chapters';
import { questions } from '../../../database/entities/questions';
import { eq, ilike, count } from 'drizzle-orm';
import { SubscriptionsAccessService } from '../../subscriptions/subscriptions-access.service';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

@Injectable()
export class LessonsService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly imagesService: ImagesService,
    private readonly subscriptionsAccessService: SubscriptionsAccessService,
  ) { }

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
      isLegacyFormat: createLessonDto.isLegacyFormat ?? false,
      orderIndex: createLessonDto.orderIndex,
    };

    return this.drizzleService.db.transaction(async (tx) => {
      const [newLesson] = await tx
        .insert(lessons)
        .values(payload)
        .returning();

      // Commit images only for structured TipTap content.
      if (!createLessonDto.isLegacyFormat && createLessonDto.content) {
        const urls = extractImageUrls(createLessonDto.content);
        if (urls.length > 0) {
          await this.imagesService.commitImages('lesson', newLesson.id, urls, tx);
        }
      }

      return newLesson;
    });
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

  async findOne(id: number, user?: UserRecord) {
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

    if (user) {
      await this.subscriptionsAccessService.assertUserHasModuleAccess(
        user,
        lesson.chapter.subject.module.id,
      );
    }

    return lesson;
  }

  async findPreview(id: number) {
    const lesson = await this.findOne(id);
    return {
      ...lesson,
      content: null,
    };
  }

  async findQuestions(id: number, page = 1, limit = 10, user?: UserRecord) {
    if (user) {
      await this.subscriptionsAccessService.assertCanViewLesson(user, id);
    } else {
      // Keep explicit lesson existence semantics when called internally without user.
      const lesson = await this.drizzleService.db.query.lessons.findFirst({
        where: eq(lessons.id, id),
        columns: { id: true },
      });

      if (!lesson) {
        throw new NotFoundException(`Lesson with ID ${id} not found`);
      }
    }

    const offset = (page - 1) * limit;

    // Select only the fields we actually need for the UI to reduce payload size
    const [data, [{ value: total }]] = await Promise.all([
      this.drizzleService.db.query.questions.findMany({
        where: eq(questions.lessonId, id),
        orderBy: (q, { asc }) => [asc(q.createdAt)],
        limit,
        offset,
        columns: {
          id: true,
          questionType: true,
          statement: true,
          statementFormat: true,
          explanation: true,
          isMisc: true,
        },
        with: {
          questionOptions: {
            columns: { id: true, optionText: true, isCorrect: true },
          },
        },
      }),
      this.drizzleService.db
        .select({ value: count() })
        .from(questions)
        .where(eq(questions.lessonId, id)),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findRecent(limit = 10) {
    return await this.drizzleService.db.query.lessons.findMany({
      orderBy: (l, { desc }) => [desc(l.updatedAt)],
      limit,
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
    const existingLesson = await this.findOne(id);

    const updatedLesson = await this.drizzleService.db.transaction(async (tx) => {
      const effectiveLegacyFormat = updateLessonDto.isLegacyFormat ?? existingLesson.isLegacyFormat ?? false;
      const legacyFormatChanged =
        updateLessonDto.isLegacyFormat !== undefined &&
        updateLessonDto.isLegacyFormat !== existingLesson.isLegacyFormat;

      if (updateLessonDto.content !== undefined) {
        if (effectiveLegacyFormat) {
          await this.imagesService.deleteAllForEntity('lesson', id, tx);
        } else {
          // Process image diff even if content is intentionally cleared.
          const newUrls = extractImageUrls(updateLessonDto.content);
          await this.imagesService.markDeletedByDiff('lesson', id, newUrls, tx);
          if (newUrls.length > 0) {
            await this.imagesService.commitImages('lesson', id, newUrls, tx);
          }
        }
      } else if (effectiveLegacyFormat && legacyFormatChanged) {
        await this.imagesService.deleteAllForEntity('lesson', id, tx);
      }

      await tx
        .update(lessons)
        .set(updateLessonDto)
        .where(eq(lessons.id, id));

      return tx.query.lessons.findFirst({
        where: eq(lessons.id, id),
        with: {
          chapter: {
            columns: { id: true, name: true, isMiscellaneous: true },
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
    });

    if (!updatedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return updatedLesson;
  }

  async remove(id: number) {
    const [deletedLesson] = await this.drizzleService.db.transaction(async (tx) => {
      await this.imagesService.deleteAllForEntity('lesson', id, tx);

      return tx
        .delete(lessons)
        .where(eq(lessons.id, id))
        .returning();
    });

    if (!deletedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return deletedLesson;
  }
}
