import { OmitType } from '@nestjs/mapped-types';
import { GenerateQuizDto } from './generate-quiz.dto';

/**
 * Request body for POST /quizzes/count.
 *
 * Identical to GenerateQuizDto but without `title` and `questionCount` —
 * those fields are irrelevant when just counting available questions.
 *
 * All remaining fields mirror the scope + status filters from GenerateQuizDto:
 *  • moduleIds, moduleType, subjectIds, chapterIds, lessonIds, isMisc
 *  • oldExamId
 *  • questionType
 *  • questionStatus  ('all' | 'incorrect_only' | 'unread')
 *
 * Sent as a JSON body (POST) rather than query params so that array fields
 * (subjectIds, chapterIds, lessonIds, etc.) are handled natively.
 */
export class CountQuestionsDto extends OmitType(GenerateQuizDto, [
  'title',
  'questionCount',
] as const) {}
