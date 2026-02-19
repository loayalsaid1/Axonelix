import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateChapterDto {
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
}
