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
import { CreateChapterDto, UpdateChapterDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }

  @Get()
  findAll(@Query('subjectId', new ParseIntPipe({ optional: true })) subjectId?: number) {
    return this.chaptersService.findAll(subjectId);
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.chaptersService.findOne(id);
  }

  @Get(':id/lessons')
  findLessons(@paramIntId() id: number) {
    return this.chaptersService.findLessons(id);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateChapterDto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number) {
    await this.chaptersService.remove(id);
  }
}
