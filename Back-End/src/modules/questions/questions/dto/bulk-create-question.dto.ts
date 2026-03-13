import { IsArray, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';
import { ReferenceDto } from '../../references/dto/reference.dto';
import { OmitType } from '@nestjs/mapped-types';


class QuestionDTO extends OmitType(CreateQuestionDto, ['reference'] as const) { }

export class BulkCreateQuestionsDto {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => QuestionDTO)
	questions: QuestionDTO[];

	/** Single reference shared by the entire batch — resolved once, applied to all questions */
	@IsOptional()
	@ValidateNested()
	@Type(() => ReferenceDto)
	reference?: ReferenceDto;
}

export class BulkCreateResultDto {
	count: number;
	questionIds: number[];
}
