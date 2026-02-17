import { IsNumber, IsString, IsOptional, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class LessonHierarchyChapterDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  isMiscellaneous?: boolean;
}

export class LessonHierarchySubjectDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class LessonHierarchyModuleDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class LessonWithHierarchyDto {
  @IsNumber()
  id: number;

  @IsNumber()
  chapterId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  content?: any;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Type(() => LessonHierarchyChapterDto)
  @IsOptional()
  chapter?: LessonHierarchyChapterDto & {
    subject?: LessonHierarchySubjectDto & {
      module?: LessonHierarchyModuleDto;
    };
  };
}
