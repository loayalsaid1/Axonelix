import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { oldExams } from '../../../database/entities/old-exams';
import { and, eq, SQL } from 'drizzle-orm';
import { CreateOldExamDto, ExamType, ModuleType } from './dto';

export interface OldExamFilters {
  moduleId?: number;
  universityId?: number;
  year?: number;
  examType?: ExamType;
  moduleType?: ModuleType;
}

@Injectable()
export class OldExamsService {
  constructor(private readonly drizzleService: DrizzleService) {}

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

  async findAll(filters: OldExamFilters = {}) {
    const conditions: SQL[] = [];

    if (filters.moduleId != null)     conditions.push(eq(oldExams.moduleId, filters.moduleId));
    if (filters.universityId != null) conditions.push(eq(oldExams.universityId, filters.universityId));
    if (filters.year != null)         conditions.push(eq(oldExams.year, filters.year));
    if (filters.examType != null)     conditions.push(eq(oldExams.examType, filters.examType));
    if (filters.moduleType != null)   conditions.push(eq(oldExams.moduleType, filters.moduleType));

    const where = conditions.length ? and(...conditions) : undefined;

    return this.drizzleService.db.query.oldExams.findMany({
      where,
      with: {
        module:     { columns: { id: true, name: true } },
        university: { columns: { id: true, name: true } },
      },
      orderBy: (e, { desc, asc }) => [desc(e.year), asc(e.examType)],
    });
  }

  async findOne(id: number) {
    const exam = await this.drizzleService.db.query.oldExams.findFirst({
      where: eq(oldExams.id, id),
      with: {
        module:     { columns: { id: true, name: true } },
        university: { columns: { id: true, name: true } },
      },
    });

    if (!exam) throw new NotFoundException(`Old exam with ID ${id} not found`);

    return exam;
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
}
