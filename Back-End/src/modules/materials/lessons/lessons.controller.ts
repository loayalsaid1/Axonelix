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
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly chaptersService: ChaptersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLessonDto: CreateLessonDto) {
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
  findAll(@Query('chapterId', new ParseIntPipe({ optional: true })) chapterId?: number) {
    return this.lessonsService.findAll(chapterId);
  }

  @Get('search')
  search(@Query('q') q: string) {
    if (!q || q.trim().length < 1) return [];
    return this.lessonsService.search(q.trim());
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.lessonsService.findOne(id);
  }

  @Get(':id/questions')
  findQuestions(@paramIntId() id: number) {
    return this.lessonsService.findQuestions(id);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number) {
    await this.lessonsService.remove(id);
  }
}
