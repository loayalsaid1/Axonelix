import { IsNumber, IsString, IsOptional, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { modules } from '../../../database/entities/modules';
import { subjects } from '../../../database/entities/subjects';
import { chapters } from '../../../database/entities/chapters';
import { lessons } from '../../../database/entities/lessons';

type ModuleRow = typeof modules.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;
type ChapterRow = typeof chapters.$inferSelect;
type LessonRow = typeof lessons.$inferSelect;

export class HierarchyLessonDto {
  @IsNumber()
  id: LessonRow['id'];

  @IsString()
  name: LessonRow['name'];

  @IsString()
  @IsOptional()
  description: LessonRow['description'];

  @IsNumber()
  @IsOptional()
  orderIndex: LessonRow['orderIndex'];

  @IsDate()
  @Type(() => Date)
  createdAt: LessonRow['createdAt'];

  @IsDate()
  @Type(() => Date)
  updatedAt: LessonRow['updatedAt'];
}

export class HierarchyChapterDto {
  @IsNumber()
  id: ChapterRow['id'];

  @IsString()
  name: ChapterRow['name'];

  @IsString()
  @IsOptional()
  description: ChapterRow['description'];

  @IsOptional()
  isMiscellaneous: ChapterRow['isMiscellaneous'];

  @IsNumber()
  @IsOptional()
  orderIndex: ChapterRow['orderIndex'];

  @IsDate()
  @Type(() => Date)
  createdAt: ChapterRow['createdAt'];

  @IsDate()
  @Type(() => Date)
  updatedAt: ChapterRow['updatedAt'];

  @IsArray()
  @Type(() => HierarchyLessonDto)
  lessons: HierarchyLessonDto[];
}

export class HierarchySubjectDto {
  @IsNumber()
  id: SubjectRow['id'];

  @IsString()
  name: SubjectRow['name'];

  @IsString()
  type: SubjectRow['type'];

  @IsString()
  @IsOptional()
  description: SubjectRow['description'];

  @IsNumber()
  @IsOptional()
  orderIndex: SubjectRow['orderIndex'];

  @IsDate()
  @Type(() => Date)
  createdAt: SubjectRow['createdAt'];

  @IsDate()
  @Type(() => Date)
  updatedAt: SubjectRow['updatedAt'];

  @IsArray()
  @Type(() => HierarchyChapterDto)
  chapters: HierarchyChapterDto[];
}

export class HierarchyResponseDto {
  @IsNumber()
  id: ModuleRow['id'];

  @IsString()
  name: ModuleRow['name'];

  @IsString()
  @IsOptional()
  description: ModuleRow['description'];

  @IsNumber()
  @IsOptional()
  orderIndex: ModuleRow['orderIndex'];

  @IsDate()
  @Type(() => Date)
  createdAt: ModuleRow['createdAt'];

  @IsDate()
  @Type(() => Date)
  updatedAt: ModuleRow['updatedAt'];

  @IsArray()
  @Type(() => HierarchySubjectDto)
  subjects: HierarchySubjectDto[];
}
