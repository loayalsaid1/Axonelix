import { IsNumber, IsString, IsOptional, IsDate, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ChapterLessonDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class ChapterSubjectDto {
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

export class ChapterResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  subjectId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isMiscellaneous?: boolean;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Type(() => ChapterSubjectDto)
  @IsOptional()
  subject?: ChapterSubjectDto;

  @IsArray()
  @Type(() => ChapterLessonDto)
  @IsOptional()
  lessons?: ChapterLessonDto[];
}
