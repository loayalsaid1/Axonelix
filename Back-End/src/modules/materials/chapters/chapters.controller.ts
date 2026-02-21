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
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ChapterResponseDto, ChapterLessonDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createChapterDto: CreateChapterDto): Promise<ChapterResponseDto> {
    return this.chaptersService.create(createChapterDto);
  }

  @Get()
  findAll(@Query('subjectId', new ParseIntPipe({ optional: true })) subjectId?: number): Promise<ChapterResponseDto[]> {
    return this.chaptersService.findAll(subjectId);
  }

  @Get(':id')
  findOne(@paramIntId() id: number): Promise<ChapterResponseDto> {
    return this.chaptersService.findOne(id);
  }

  @Get(':id/lessons')
  findLessons(@paramIntId() id: number): Promise<ChapterLessonDto[]> {
    return this.chaptersService.findLessons(id);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number): Promise<void> {
    await this.chaptersService.remove(id);
  }
}
