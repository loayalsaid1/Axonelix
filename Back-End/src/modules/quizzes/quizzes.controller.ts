import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { paramIntId } from '../../common/decorators/param-int-id.decorator';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { QuizzesService } from './quizzes.service';
import { QuestionCountService } from './question-count.service';
import { QuizOwnerGuard } from './guards/quiz-owner.guard';
import { CountQuestionsDto, GenerateQuizDto } from './dto';

@UseGuards(ClerkAuthGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly questionCountService: QuestionCountService,
  ) {}

  /**
   * POST /quizzes/count
   *
   * Returns the number of questions available for the given filter combination.
   * Accepts the same scope + status filters as POST /quizzes (minus title and
   * questionCount).  Used by the test-generator UI to show the live
   * "X questions available" counter as the user adjusts filters.
   *
   * Uses POST instead of GET so that array filter params (subjectIds,
   * chapterIds, lessonIds, etc.) are sent as a JSON body and avoid
   * query-string array-parsing issues.
   */
  @Post('count')
  @HttpCode(HttpStatus.OK)
  count(
    @Body() dto: CountQuestionsDto,
    @CurrentUser() user: UserRecord,
  ) {
    return this.questionCountService.count(dto, user.id);
  }

  /**
   * POST /quizzes
   *
   * Generate a quiz from the given filters.  Auto-creates a `not_started`
   * session and returns `{ quiz, session }` so the client can redirect
   * straight to the session page.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  generate(@Body() dto: GenerateQuizDto, @CurrentUser() user: UserRecord) {
    return this.quizzesService.generate(dto, user.id);
  }

  /**
   * GET /quizzes
   *
   * Paginated list of the authenticated user's quizzes.
   */
  @Get()
  findAll(
    @CurrentUser() user: UserRecord,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.quizzesService.findAll(user.id, page, limit);
  }

  /**
   * GET /quizzes/:id
   *
   * Quiz details including fully populated questions + options.
   */
  @UseGuards(QuizOwnerGuard)
  @Get(':id')
  findOne(@paramIntId() id: number, @CurrentUser() user: UserRecord) {
    return this.quizzesService.findOne(id, user.id);
  }

  /**
   * DELETE /quizzes/:id
   *
   * Remove a quiz (cascades to quiz_questions and quiz_sessions).
   */
  @UseGuards(QuizOwnerGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @paramIntId() id: number,
    @CurrentUser() user: UserRecord,
  ): Promise<void> {
    await this.quizzesService.remove(id, user.id);
  }
}
