import { IsNumber, IsString, IsOptional, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { lessons } from '../../../../database/entities/lessons';
import { chapters } from '../../../../database/entities/chapters';

type LessonRow = typeof lessons.$inferSelect;
type ChapterRow = typeof chapters.$inferSelect;

export class LessonChapterDto {
  @IsNumber()
  id: ChapterRow['id'];

  @IsString()
  name: ChapterRow['name'];

  @IsString()
  @IsOptional()
  description?: ChapterRow['description'];
}

export class LessonResponseDto {
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

  @Type(() => LessonChapterDto)
  @IsOptional()
  chapter?: LessonChapterDto;
}
