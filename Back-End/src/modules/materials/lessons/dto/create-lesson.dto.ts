import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';

export class CreateLessonDto {
  @IsNumber()
  chapterId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  content?: any; // TipTap JSON content

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
