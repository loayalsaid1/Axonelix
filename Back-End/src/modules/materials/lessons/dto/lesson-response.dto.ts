import { IsNumber, IsString, IsOptional, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class LessonChapterDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class LessonResponseDto {
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

  @Type(() => LessonChapterDto)
  @IsOptional()
  chapter?: LessonChapterDto;
}
