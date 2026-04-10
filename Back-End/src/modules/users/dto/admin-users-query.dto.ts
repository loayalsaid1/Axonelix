import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Role } from '../../../common/enums';

export const CreatedAtSortOrder = {
  Asc: 'asc',
  Desc: 'desc',
} as const;

export type CreatedAtSortOrder =
  (typeof CreatedAtSortOrder)[keyof typeof CreatedAtSortOrder];

export class AdminUsersQueryDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsEnum(CreatedAtSortOrder)
  sortCreatedAt: CreatedAtSortOrder = CreatedAtSortOrder.Desc;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
