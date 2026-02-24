import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { questionOptions } from '../../../database/entities/question-options';
import { eq } from 'drizzle-orm';
import { QuestionOptionDto } from './dto';

type OptionInsert = typeof questionOptions.$inferInsert;

@Injectable()
export class QuestionOptionsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  /** Insert all options for a given question */
  async createMany(questionId: number, options: QuestionOptionDto[]) {
    const rows: OptionInsert[] = options.map((o) => ({
      questionId,
      optionText: o.optionText,
      isCorrect: o.isCorrect,
    }));

    return this.drizzleService.db
      .insert(questionOptions)
      .values(rows)
      .returning();
  }

  /** Delete all existing options then insert the new set */
  async replaceOptions(questionId: number, options: QuestionOptionDto[]) {
    await this.drizzleService.db
      .delete(questionOptions)
      .where(eq(questionOptions.questionId, questionId));

    if (!options.length) return [];

    return this.createMany(questionId, options);
  }

  async findByQuestion(questionId: number) {
    return this.drizzleService.db.query.questionOptions.findMany({
      where: eq(questionOptions.questionId, questionId),
    });
  }

  async deleteByQuestion(questionId: number) {
    return this.drizzleService.db
      .delete(questionOptions)
      .where(eq(questionOptions.questionId, questionId))
      .returning();
  }
}
