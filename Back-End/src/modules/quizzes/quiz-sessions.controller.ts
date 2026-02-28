import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { QuizSessionsService } from './quiz-sessions.service';
import { QuizSessionOwnerGuard } from './guards/quiz-session-owner.guard';
import { UpdateSessionStatusDto } from './dto';

@UseGuards(ClerkAuthGuard)
@Controller('quiz-sessions')
export class QuizSessionsController {
  constructor(private readonly quizSessionsService: QuizSessionsService) {}

  /**
   * GET /quiz-sessions
   *
   * Paginated list of the user's sessions with basic quiz info.
   */
  @Get()
  findAll(
    @CurrentUser() user: UserRecord,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.quizSessionsService.findAll(user.id, page, limit);
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
  ) {
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
  ) {
    return this.quizSessionsService.updateStatus(sessionId, user.id, dto);
  }
}
