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
import { CreateSubjectDto, UpdateSubjectDto, SubjectResponseDto, SubjectChapterDto } from './dto';
import { paramIntId, Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';

@Controller('materials/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles([Role.Admin])
  create(@Body() createSubjectDto: CreateSubjectDto): Promise<SubjectResponseDto> {
    return this.subjectsService.create(createSubjectDto);
  }

  @Get()
  findAll(@Query('moduleId', new ParseIntPipe({ optional: true })) moduleId?: number): Promise<SubjectResponseDto[]> {
    return this.subjectsService.findAll(moduleId);
  }

  @Get(':id')
  findOne(@paramIntId() id: number): Promise<SubjectResponseDto> {
    return this.subjectsService.findOne(id);
  }

  @Get(':id/chapters')
  findChapters(@paramIntId() id: number): Promise<SubjectChapterDto[]> {
    return this.subjectsService.findChapters(id);
  }

  @Patch(':id')
  @Roles([Role.Admin])
  update(
    @paramIntId() id: number,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ): Promise<SubjectResponseDto> {
    return this.subjectsService.update(id, updateSubjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([Role.Admin])
  async remove(@paramIntId() id: number): Promise<void> {
    await this.subjectsService.remove(id);
  }
}
