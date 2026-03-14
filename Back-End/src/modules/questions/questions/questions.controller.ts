import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionFilterDto,
  BulkCreateQuestionsDto,
} from './dto';
import { paramIntId, Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  // ── Simple CRUD ────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles([Role.Admin])
  create(@Body() dto: CreateQuestionDto) {
    return this.questionsService.create(dto);
  }

  /**
   * POST /questions/bulk
   * Atomically insert a batch of questions and their options in a single
   * database transaction. Either all succeed or none are committed.
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @Roles([Role.Admin])
  bulkCreate(@Body() dto: BulkCreateQuestionsDto) {
    return this.questionsService.bulkCreate(dto);
  }

  /**
   * Simple list endpoint supporting basic filters as query params.
   * For complex hierarchy-scoped filtering use POST /questions/filter.
   */
  @Get()
  findAll(
    @Query('lessonId', new ParseIntPipe({ optional: true })) lessonId?: number,
    @Query('chapterId', new ParseIntPipe({ optional: true })) chapterId?: number,
    @Query('oldExamId', new ParseIntPipe({ optional: true })) oldExamId?: number,
    @Query('referenceId', new ParseIntPipe({ optional: true })) referenceId?: number,
    @Query('questionType') questionType?: string,
    @Query('isMisc') isMiscRaw?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 40,
  ) {
    const isMisc = isMiscRaw !== undefined ? isMiscRaw === 'true' : undefined;
    return this.questionsService.findAll(
      { lessonId, chapterId, oldExamId, referenceId, questionType, isMisc },
      page,
      limit,
    );
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @Roles([Role.Admin])
  update(@paramIntId() id: number, @Body() dto: UpdateQuestionDto) {
    return this.questionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([Role.Admin])
  async remove(@paramIntId() id: number): Promise<void> {
    await this.questionsService.remove(id);
  }

  // ── Advanced filter ────────────────────────────────────────────────────────

  /**
   * POST /questions/filter
   * Full hierarchy-scoped filtering with pagination.
   * Body: QuestionFilterDto
   */
  @Post('filter')
  @HttpCode(HttpStatus.OK)
  filter(
    @Body() filterDto: QuestionFilterDto,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 40,
  ) {
    return this.questionsService.filter(filterDto, page, limit);
  }

  /**
   * POST /questions/filter/ids
   * Same hierarchy scope as /filter but returns only question IDs.
   * Intended for quiz generation.
   */
  @Post('filter/ids')
  @HttpCode(HttpStatus.OK)
  filterIds(@Body() filterDto: QuestionFilterDto) {
    return this.questionsService.filterIds(filterDto);
  }
}
