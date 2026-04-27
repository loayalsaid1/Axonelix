import { Injectable, NotFoundException, ConflictException, forwardRef, Inject } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { oldExams } from '../../../database/entities/old-exams';
import { and, eq, inArray, SQL } from 'drizzle-orm';
import { CreateOldExamDto, ExamType, ModuleType } from './dto';
import { SubscriptionsAccessService } from '../../subscriptions/subscriptions-access.service';
import { QuestionsService } from '../questions/questions.service';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

export interface OldExamFilters {
  moduleId?: number;
  universityId?: number;
  year?: number;
  examType?: ExamType;
  moduleType?: ModuleType;
}

type QuestionType = 'mcq' | 'written';

@Injectable()
export class OldExamsService {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly subscriptionsAccessService: SubscriptionsAccessService,
    @Inject(forwardRef(() => QuestionsService))
    private readonly questionsService: QuestionsService,
  ) { }

  async create(dto: CreateOldExamDto) {
    // Guard uniqueness constraint (DB will also enforce, but gives a nicer error)
    const existing = await this.drizzleService.db.query.oldExams.findFirst({
      where: and(
        eq(oldExams.examType, dto.examType),
        eq(oldExams.moduleId, dto.moduleId),
        eq(oldExams.moduleType, dto.moduleType),
        eq(oldExams.universityId, dto.universityId),
        eq(oldExams.year, dto.year),
      ),
      columns: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        'An old exam with the same exam type, module, module type, university and year already exists.',
      );
    }

    const [exam] = await this.drizzleService.db
      .insert(oldExams)
      .values(dto)
      .returning();

    return exam;
  }

  async findAll(filters: OldExamFilters = {}, user?: UserRecord) {
    const conditions: SQL[] = [];

    if (filters.moduleId != null) {
      conditions.push(eq(oldExams.moduleId, filters.moduleId));
    }
    if (filters.universityId != null) conditions.push(eq(oldExams.universityId, filters.universityId));
    if (filters.year != null) conditions.push(eq(oldExams.year, filters.year));
    if (filters.examType != null) conditions.push(eq(oldExams.examType, filters.examType));
    if (filters.moduleType != null) conditions.push(eq(oldExams.moduleType, filters.moduleType));

    if (user && !this.subscriptionsAccessService.isAdmin(user)) {
      if (filters.moduleId != null) {
        await this.subscriptionsAccessService.assertUserHasModuleAccess(
          user,
          filters.moduleId,
        );
      } else {
        const ownedModuleIds = await this.subscriptionsAccessService.getOwnedModuleIds(
          user.id,
        );

        if (!ownedModuleIds.length) {
          return [];
        }

        conditions.push(inArray(oldExams.moduleId, ownedModuleIds));
      }
    }

    const where = conditions.length ? and(...conditions) : undefined;

    return this.drizzleService.db.query.oldExams.findMany({
      where,
      with: {
        module: { columns: { id: true, name: true } },
        university: { columns: { id: true, name: true } },
      },
      orderBy: (e, { desc, asc }) => [desc(e.year), asc(e.examType)],
    });
  }

  async findOne(id: number, user?: UserRecord) {
    const exam = await this.drizzleService.db.query.oldExams.findFirst({
      where: eq(oldExams.id, id),
      with: {
        module: { columns: { id: true, name: true } },
        university: { columns: { id: true, name: true } },
      },
    });

    if (!exam) throw new NotFoundException(`Old exam with ID ${id} not found`);

    if (user) {
      await this.subscriptionsAccessService.assertUserHasModuleAccess(
        user,
        exam.moduleId,
      );
    }

    return exam;
  }

  /**
   * Fast existence and access check without expensive SQL joins.
   * Optimizes performance when only checking access (e.g., fetching questions).
   */
  async verifyAccess(id: number, user?: UserRecord): Promise<void> {
    const exam = await this.drizzleService.db.query.oldExams.findFirst({
      where: eq(oldExams.id, id),
      columns: { id: true, moduleId: true },
    });

    if (!exam) throw new NotFoundException(`Old exam with ID ${id} not found`);

    if (user && !this.subscriptionsAccessService.isAdmin(user)) {
      await this.subscriptionsAccessService.assertUserHasModuleAccess(
        user,
        exam.moduleId,
      );
    }
  }

  async update(id: number, dto: Partial<CreateOldExamDto>) {
    const [updated] = await this.drizzleService.db
      .update(oldExams)
      .set(dto)
      .where(eq(oldExams.id, id))
      .returning();

    if (!updated) throw new NotFoundException(`Old exam with ID ${id} not found`);

    return updated;
  }

  async remove(id: number) {
    const [deleted] = await this.drizzleService.db
      .delete(oldExams)
      .where(eq(oldExams.id, id))
      .returning();

    if (!deleted) throw new NotFoundException(`Old exam with ID ${id} not found`);

    return deleted;
  }

  /**
   * Orchestrate fetching questions for a specific old exam.
   * Leverages QuestionsService for the actual data fetching.
   */
  async findQuestions(
    id: number,
    page = 1,
    limit = 40,
    questionType?: QuestionType,
    user?: UserRecord,
  ) {
    // 1. Fast existence and user access check
    await this.verifyAccess(id, user);

    // 2. Delegate to QuestionsService to get the questions
    return this.questionsService.findByOldExamId(id, page, limit, questionType);
  }
}
