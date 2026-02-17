import { IsNumber, IsString, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleSubjectDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}

export class ModuleResponseDto {
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

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsArray()
  @Type(() => ModuleSubjectDto)
  @IsOptional()
  subjects?: ModuleSubjectDto[];
}
