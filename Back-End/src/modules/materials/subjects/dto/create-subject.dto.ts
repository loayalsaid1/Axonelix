import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum SubjectType {
  THEORETICAL = 'theoretical',
  PRACTICAL = 'practical',
}

export class CreateSubjectDto {
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
}
