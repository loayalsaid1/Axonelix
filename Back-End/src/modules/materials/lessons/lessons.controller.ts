import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { ChaptersService } from '../chapters/chapters.service';
import { CreateLessonDto, UpdateLessonDto, LessonResponseDto, LessonWithHierarchyDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly chaptersService: ChaptersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLessonDto: CreateLessonDto): Promise<LessonResponseDto> {
    if (!createLessonDto.chapterId) {
      // Misc lesson path: get or create the subject's misc chapter
      if (createLessonDto.isMisc && createLessonDto.subjectId) {
        const miscChapter = await this.chaptersService.getOrCreateMiscChapter(createLessonDto.subjectId);
        createLessonDto.chapterId = miscChapter.id;
      } else {
        throw new BadRequestException(
          'Provide a chapterId, or set isMisc=true with a subjectId to place the lesson in the subject\'s misc chapter.',
        );
      }
    }

    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll(@Query('chapterId', new ParseIntPipe({ optional: true })) chapterId?: number): Promise<LessonResponseDto[]> {
    return this.lessonsService.findAll(chapterId);
  }

  @Get('recent')
  findRecent(@Query('limit', new ParseIntPipe({ optional: true })) limit = 10) {
    return this.lessonsService.findRecent(limit);
  }

  @Get('search')
  search(@Query('q') q: string): Promise<LessonWithHierarchyDto[]> | LessonWithHierarchyDto[] {
    if (!q || q.trim().length < 1) return [];
    return this.lessonsService.search(q.trim());
  }

  @Get(':id')
  findOne(@paramIntId() id: number): Promise<LessonWithHierarchyDto> {
    return this.lessonsService.findOne(id);
  }

  @Get(':id/questions')
  findQuestions(
    @paramIntId() id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.lessonsService.findQuestions(id, page, limit);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ): Promise<LessonResponseDto> {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number): Promise<void> {
    await this.lessonsService.remove(id);
  }
}
