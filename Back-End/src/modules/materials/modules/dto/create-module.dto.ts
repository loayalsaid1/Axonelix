import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;
}
