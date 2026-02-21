import { IsNumber, IsString, IsOptional, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { lessons } from '../../../../database/entities/lessons';
import { chapters } from '../../../../database/entities/chapters';
import { subjects } from '../../../../database/entities/subjects';
import { modules } from '../../../../database/entities/modules';

type LessonRow = typeof lessons.$inferSelect;
type ChapterRow = typeof chapters.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;
type ModuleRow = typeof modules.$inferSelect;

export class LessonHierarchyChapterDto {
  @IsNumber()
  id: ChapterRow['id'];

  @IsString()
  name: ChapterRow['name'];

  @IsString()
  @IsOptional()
  description?: ChapterRow['description'];

  @IsOptional()
  isMiscellaneous?: ChapterRow['isMiscellaneous'];
}

export class LessonHierarchySubjectDto {
  @IsNumber()
  id: SubjectRow['id'];

  @IsString()
  name: SubjectRow['name'];

  @IsString()
  type: SubjectRow['type'];

  @IsString()
  @IsOptional()
  description?: SubjectRow['description'];
}

export class LessonHierarchyModuleDto {
  @IsNumber()
  id: ModuleRow['id'];

  @IsString()
  name: ModuleRow['name'];

  @IsString()
  @IsOptional()
  description?: ModuleRow['description'];
}

export class LessonWithHierarchyDto {
  @IsNumber()
  id: LessonRow['id'];

  @IsNumber()
  chapterId: LessonRow['chapterId'];

  @IsString()
  name: LessonRow['name'];

  @IsString()
  @IsOptional()
  description: LessonRow['description'];

  @IsObject()
  @IsOptional()
  content: LessonRow['content'];

  @IsNumber()
  @IsOptional()
  orderIndex: LessonRow['orderIndex'];

  @IsDate()
  @Type(() => Date)
  createdAt: LessonRow['createdAt'];

  @IsDate()
  @Type(() => Date)
  updatedAt: LessonRow['updatedAt'];

  @Type(() => LessonHierarchyChapterDto)
  @IsOptional()
  chapter?: LessonHierarchyChapterDto & {
    subject?: LessonHierarchySubjectDto & {
      module?: LessonHierarchyModuleDto;
    };
  };
}
