import { IsNumber, IsString, IsOptional, IsDate, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { SubjectType } from './create-subject.dto';

export class SubjectChapterDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  isMiscellaneous?: boolean;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class SubjectModuleDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class SubjectResponseDto {
  @IsNumber()
  id: number;

  @IsNumber()
  moduleId: number;

  @IsString()
  name: string;

  @IsEnum(SubjectType)
  type: SubjectType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @Type(() => SubjectModuleDto)
  @IsOptional()
  module?: SubjectModuleDto;

  @IsArray()
  @Type(() => SubjectChapterDto)
  @IsOptional()
  chapters?: SubjectChapterDto[];
}
