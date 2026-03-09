import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class BulkCreateQuestionsDto {
	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CreateQuestionDto)
	questions: CreateQuestionDto[];
}

export class BulkCreateResultDto {
	count: number;
	questionIds: number[];
}
