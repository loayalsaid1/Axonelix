import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Represents a single answered (or marked/eliminated) question submitted in
 * a batch when the user suspends or ends a session.
 */
export class AnswerDto {
  @IsInt()
  @Type(() => Number)
  questionId: number;

  /** MCQ: the chosen option's ID */
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  selectedOptionId?: number;

  /** Written questions: free-text response */
  @IsString()
  @IsOptional()
  writtenAnswer?: string;

  /** Whether the user flagged this question for review */
  @IsBoolean()
  @IsOptional()
  isMarked?: boolean;

  /** Whether the user eliminated this question (strike-through mode) */
  @IsBoolean()
  @IsOptional()
  isEliminated?: boolean;
}
