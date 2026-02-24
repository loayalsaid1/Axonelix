import { IsEnum, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { oldExams } from '../../../../database/entities/old-exams';

type OldExamInsert = typeof oldExams.$inferInsert;

export const EXAM_TYPES = ['final', 'midterm', 'tpl', 'flipped'] as const;
export const MODULE_TYPES = ['theoretical', 'practical'] as const;

export type ExamType = (typeof EXAM_TYPES)[number];
export type ModuleType = (typeof MODULE_TYPES)[number];

export class CreateOldExamDto {
  @IsEnum(EXAM_TYPES)
  examType: OldExamInsert['examType'];

  @IsNumber()
  @Type(() => Number)
  moduleId: OldExamInsert['moduleId'];

  @IsEnum(MODULE_TYPES)
  moduleType: OldExamInsert['moduleType'];

  @IsNumber()
  @Type(() => Number)
  universityId: OldExamInsert['universityId'];

  @IsInt()
  @Min(2000)
  @Max(2100)
  @Type(() => Number)
  year: OldExamInsert['year'];
}
