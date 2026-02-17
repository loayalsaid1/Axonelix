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
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(createLessonDto);
  }

  @Get()
  findAll(@Query('chapterId', new ParseIntPipe({ optional: true })) chapterId?: number) {
    return this.lessonsService.findAll(chapterId);
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
