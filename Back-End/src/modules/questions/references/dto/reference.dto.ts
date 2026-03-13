import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ReferenceDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  text?: string;
}

export class CreateReferenceDto {
  @IsString()
  name: string;
}

export class UpdateReferenceDto {
  @IsOptional()
  @IsString()
  name?: string;
}
