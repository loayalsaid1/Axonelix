import {
  IsEnum,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { questions } from '../../../../database/entities/questions';

type QuestionInsert = typeof questions.$inferInsert;

export class QuestionOptionInputDto {
  @IsString()
  optionText: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsEnum(['mcq', 'written'])
  questionType: QuestionInsert['questionType'];

  @IsString()
  statement: QuestionInsert['statement'];

  @IsEnum(['text', 'tiptap_json'])
  @IsOptional()
  statementFormat?: QuestionInsert['statementFormat'];

  @IsOptional()
  explanation?: QuestionInsert['explanation'];

  /** ID of the lesson this question is attached to (mutually exclusive with chapterId for misc) */
  @IsNumber()
  @IsOptional()
  lessonId?: QuestionInsert['lessonId'];

  /** ID of the chapter for misc/chapter-level questions */
  @IsNumber()
  @IsOptional()
  chapterId?: QuestionInsert['chapterId'];

  /** Whether this is a miscellaneous question attached to a chapter (not a lesson) */
  @IsBoolean()
  @IsOptional()
  isMisc?: QuestionInsert['isMisc'];

  /** Old exam this question belongs to (optional) */
  @IsNumber()
  @IsOptional()
  oldExamId?: QuestionInsert['oldExamId'];

  /** MCQ answer options — required when questionType === 'mcq' */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionInputDto)
  @ValidateIf((o: CreateQuestionDto) => o.questionType === 'mcq')
  @IsOptional()
  options?: QuestionOptionInputDto[];
}
