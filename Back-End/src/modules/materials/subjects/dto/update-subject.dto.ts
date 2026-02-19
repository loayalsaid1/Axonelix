import { PartialType } from '@nestjs/mapped-types';
import { CreateSubjectDto } from './create-subject.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateSubjectDto extends PartialType(
  OmitType(CreateSubjectDto, ['moduleId'] as const),
) {}
