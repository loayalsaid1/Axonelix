import { oldExams } from '../../../../database/entities/old-exams';

type OldExamRow = typeof oldExams.$inferSelect;

export class OldExamResponseDto {
  id!: OldExamRow['id'];
  examType!: OldExamRow['examType'];
  moduleId!: OldExamRow['moduleId'];
  moduleType!: OldExamRow['moduleType'];
  universityId!: OldExamRow['universityId'];
  year!: OldExamRow['year'];
  createdAt!: OldExamRow['createdAt'];
}
