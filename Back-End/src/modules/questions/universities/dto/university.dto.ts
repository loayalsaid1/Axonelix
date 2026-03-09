import { IsString } from 'class-validator';
import { universities } from '../../../../database/entities/universities';

type UniversityInsert = typeof universities.$inferInsert;
type UniversityRow = typeof universities.$inferSelect;

export class CreateUniversityDto {
  @IsString()
  name: UniversityInsert['name'];
}

export class UniversityResponseDto {
  id!: UniversityRow['id'];
  name!: UniversityRow['name'];
  createdAt!: UniversityRow['createdAt'];
}
