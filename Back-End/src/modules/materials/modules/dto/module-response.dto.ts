import { IsNumber, IsString, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { modules } from '../../../../database/entities/modules';
import { subjects } from '../../../../database/entities/subjects';

type ModuleRow = typeof modules.$inferSelect;
type SubjectRow = typeof subjects.$inferSelect;

export class ModuleSubjectDto {
  @IsNumber()
  id: SubjectRow['id'];

  @IsString()
  name: SubjectRow['name'];

  @IsString()
  type: SubjectRow['type'];

  @IsString()
  @IsOptional()
  description: SubjectRow['description'];

  @IsNumber()
  @IsOptional()
  orderIndex: SubjectRow['orderIndex'];
}

export class ModuleResponseDto {
  @IsNumber()
  id: ModuleRow['id'];

  @IsString()
  name: ModuleRow['name'];

  @IsString()
  @IsOptional()
  description: ModuleRow['description'];

  @IsNumber()
  @IsOptional()
  orderIndex: ModuleRow['orderIndex'];

  @IsDate()
  @Type(() => Date)
  createdAt: ModuleRow['createdAt'];

  @IsDate()
  @Type(() => Date)
  updatedAt: ModuleRow['updatedAt'];

  @IsArray()
  @Type(() => ModuleSubjectDto)
  @IsOptional()
  subjects?: ModuleSubjectDto[];
}
