import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnswerDto } from './answer.dto';
import type { SessionMetadata } from './session-metadata.interface';

/**
 * Body payload for PATCH /quiz-sessions/:sessionId/status.
 *
 * The `status` field drives everything:
 *
 *   in_progress  → start / resume the session (no answers needed)
 *   suspended    → pause; client sends full answer map + UI metadata snapshot
 *   completed    → end;   client sends full answer map + metadata;
 *                  server computes stats and sets endedAt
 *
 * Valid transitions (enforced by QuizSessionsService):
 *   not_started → in_progress
 *   suspended   → in_progress   (resume)
 *   in_progress → suspended
 *   in_progress → completed
 */
export class UpdateSessionStatusDto {
  @IsEnum(['in_progress', 'suspended', 'completed'])
  status: 'in_progress' | 'suspended' | 'completed';

  /**
   * Full answer batch.  Required when status = 'suspended' | 'completed'.
   * Re-sending all answers on each call is intentional – it allows the server
   * to do a clean upsert and avoids partial-update bugs.
   */
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @IsOptional()
  answers?: AnswerDto[];

  /** Client-side navigation snapshot (current question, seen/unseen lists, …) */
  @IsObject()
  @IsOptional()
  metadata?: SessionMetadata;

  /** Elapsed time in seconds – client tracks this and sends on end/suspend */
  @IsInt()
  @IsOptional()
  timeTakenSecs?: number;
}
