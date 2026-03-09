import { IsString, IsOptional, IsNumber, IsObject, IsBoolean } from 'class-validator';

export class CreateLessonDto {
  @IsNumber()
  @IsOptional()
  chapterId?: number;

  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @IsBoolean()
  @IsOptional()
  isMisc?: boolean;

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
