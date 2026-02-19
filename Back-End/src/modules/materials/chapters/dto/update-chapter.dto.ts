import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateChapterDto } from './create-chapter.dto';

export class UpdateChapterDto extends PartialType(
  OmitType(CreateChapterDto, ['subjectId'] as const),
) {}
