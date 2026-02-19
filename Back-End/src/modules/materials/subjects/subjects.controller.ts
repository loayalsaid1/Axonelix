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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createSubjectDto: CreateSubjectDto) {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  findAll(@Query('moduleId', new ParseIntPipe({ optional: true })) moduleId?: number) {
    return this.subjectsService.findAll(moduleId);
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.subjectsService.findOne(id);
  }

  @Get(':id/chapters')
  findChapters(@paramIntId() id: number) {
    return this.subjectsService.findChapters(id);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number) {
    await this.subjectsService.remove(id);
  }
}
