import { IsNumber, IsString, IsOptional, IsDate, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { chapters } from '../../../../database/entities/chapters';
import { subjects } from '../../../../database/entities/subjects';
import { modules } from '../../../../database/entities/modules';
import { lessons } from '../../../../database/entities/lessons';

type ChapterRow = typeof chapters.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;
type ModuleRow = typeof modules.$inferSelect;
type LessonRow = typeof lessons.$inferSelect;

export class ChapterLessonDto {
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
}

export class ChapterSubjectDto {
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

export class ChapterModuleDto {
  @IsNumber()
  id: ModuleRow['id'];

  @IsString()
  name: ModuleRow['name'];

  @IsString()
  @IsOptional()
  description?: ModuleRow['description'];
}

export class ChapterResponseDto {
  @IsNumber()
  id: ChapterRow['id'];

  @IsNumber()
  subjectId: ChapterRow['subjectId'];

  @IsString()
  name: ChapterRow['name'];

  @IsString()
  @IsOptional()
  description: ChapterRow['description'];

  @IsBoolean()
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

  @Type(() => ChapterSubjectDto)
  @IsOptional()
  subject?: ChapterSubjectDto & {
    module?: ChapterModuleDto;
  };

  @IsArray()
  @Type(() => ChapterLessonDto)
  @IsOptional()
  lessons?: ChapterLessonDto[];
}
