import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import type { QuizSessionStatus } from './quiz-sessions.service';
import { QuizSessionsService } from './quiz-sessions.service';
import { QuizSessionOwnerGuard } from './guards/quiz-session-owner.guard';
import {
  UpdateSessionStatusDto,
  PaginatedQuizSessionsDto,
  QuizSessionDetailResponseDto,
  UserTestStatsDto,
} from './dto';


const SESSION_STATUSES = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  suspended: 'suspended',
  completed: 'completed',
} as const;

@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) { }

  /**
   * GET /quiz-sessions/user-stats
   *
   * Returns aggregated statistics for the authenticated user's test history:
   * total sessions, per-status counts, and average score across completed sessions.
   *
   * NOTE: This route MUST be declared before GET /:sessionId so NestJS does not
   * attempt to parse the literal string "user-stats" as an integer session ID.
   */
  @Get('user-stats')
  getStats(@CurrentUser() user: UserRecord): Promise<UserTestStatsDto> {
    return this.quizSessionsService.getStats(user.id);
  }

  /**
   * GET /quiz-sessions
   *
   * Paginated list of the user's sessions with basic quiz info.
   *
   * @param status Optional filter — only return sessions of this status.
   */
  @Get()
  findAll(
    @CurrentUser() user: UserRecord,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('status', new ParseEnumPipe(SESSION_STATUSES, { optional: true }))
    status?: string,
  ): Promise<PaginatedQuizSessionsDto> {
    return this.quizSessionsService.findAll(user.id, page, limit, status as QuizSessionStatus | undefined);
  }

  /**
   * GET /quiz-sessions/:sessionId
   *
   * Full session detail: session row + all answers + quiz with populated
   * questions (+ options).  This single call drives both initial load and
   * resume hydration on the session page.
   */
  @UseGuards(QuizSessionOwnerGuard)
  @Get(':sessionId')
  findOne(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: UserRecord,
  ): Promise<QuizSessionDetailResponseDto> {
    return this.quizSessionsService.findOne(sessionId, user.id);
  }

  /**
   * PATCH /quiz-sessions/:sessionId/status
   *
   * Advance the session through its lifecycle:
   *
   *   { status: 'in_progress' }
   *     → start or resume; sets startedAt on first call
   *
   *   { status: 'suspended', answers, metadata, timeTakenSecs }
   *     → pause; persists the full answer batch + UI snapshot
   *
   *   { status: 'completed', answers, metadata, timeTakenSecs }
   *     → end; persists answers, computes stats, sets endedAt
   */
  @UseGuards(QuizSessionOwnerGuard)
  @Patch(':sessionId/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() dto: UpdateSessionStatusDto,
    @CurrentUser() user: UserRecord,
  ): Promise<QuizSessionDetailResponseDto> {
    return this.quizSessionsService.updateStatus(sessionId, user.id, dto);
  }

  /**
   * DELETE /quiz-sessions/:sessionId
   *
   * Permanently removes the session and all its answer records (FK cascade).
   * The parent quiz is NOT deleted — only this specific session entry is removed.
   *
   * Returns 204 No Content on success.
   */
  @UseGuards(QuizSessionOwnerGuard)
  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @CurrentUser() user: UserRecord,
  ): Promise<void> {
    await this.quizSessionsService.remove(sessionId, user.id);
  }
}
