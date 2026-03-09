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
import { OldExamsService } from './old-exams.service';
import type { ExamType, ModuleType } from './dto';
import { CreateOldExamDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('questions/old-exams')
export class OldExamsController {
  constructor(private readonly oldExamsService: OldExamsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateOldExamDto) {
    return this.oldExamsService.create(dto);
  }

  @Get()
  findAll(
    @Query('moduleId',     new ParseIntPipe({ optional: true })) moduleId?: number,
    @Query('universityId', new ParseIntPipe({ optional: true })) universityId?: number,
    @Query('year',         new ParseIntPipe({ optional: true })) year?: number,
    @Query('examType') examType?: ExamType,
    @Query('moduleType') moduleType?: ModuleType,
  ) {
    return this.oldExamsService.findAll({ moduleId, universityId, year, examType, moduleType });
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.oldExamsService.findOne(id);
  }

  @Patch(':id')
  update(@paramIntId() id: number, @Body() dto: Partial<CreateOldExamDto>) {
    return this.oldExamsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number): Promise<void> {
    await this.oldExamsService.remove(id);
  }
}
