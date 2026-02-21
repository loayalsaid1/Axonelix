import { IsNumber, IsString, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { subjects } from '../../../../database/entities/subjects';
import { chapters } from '../../../../database/entities/chapters';
import { modules } from '../../../../database/entities/modules';

type SubjectRow = typeof subjects.$inferSelect;
type ChapterRow = typeof chapters.$inferSelect;
type ModuleRow = typeof modules.$inferSelect;

export class SubjectChapterDto {
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
}

export class SubjectModuleDto {
  @IsNumber()
  id: ModuleRow['id'];

  @IsString()
  name: ModuleRow['name'];

  @IsString()
  @IsOptional()
  description: ModuleRow['description'];
}

export class SubjectResponseDto {
  @IsNumber()
  id: SubjectRow['id'];

  @IsNumber()
  moduleId: SubjectRow['moduleId'];

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

  @Type(() => SubjectModuleDto)
  @IsOptional()
  module?: SubjectModuleDto;

  @IsArray()
  @Type(() => SubjectChapterDto)
  @IsOptional()
  chapters?: SubjectChapterDto[];
}
