import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { IsNumber, IsBoolean, ValidateIf } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
	@IsNumber()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	lessonId?: number | null;

	@IsNumber()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	chapterId?: number | null;

	@IsBoolean()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	isMisc?: boolean | null;

	@IsNumber()
	@ValidateIf((_, value) => value !== null && value !== undefined)
	oldExamId?: number | null;
}
