import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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

  @IsOptional()
  content?: any; // TipTap JSON content

  @IsBoolean()
  @IsOptional()
  isLegacyFormat?: boolean;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
