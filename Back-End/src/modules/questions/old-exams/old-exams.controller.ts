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
import { CurrentUser, paramIntId, Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

@Controller('questions/old-exams')
export class OldExamsController {
  constructor(private readonly oldExamsService: OldExamsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles([Role.Admin])
  create(@Body() dto: CreateOldExamDto) {
    return this.oldExamsService.create(dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: UserRecord,
    @Query('moduleId', new ParseIntPipe({ optional: true })) moduleId?: number,
    @Query('universityId', new ParseIntPipe({ optional: true })) universityId?: number,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('examType') examType?: ExamType,
    @Query('moduleType') moduleType?: ModuleType,
  ) {
    return this.oldExamsService.findAll(
      { moduleId, universityId, year, examType, moduleType },
      user,
    );
  }

  @Get(':id')
  findOne(@paramIntId() id: number, @CurrentUser() user: UserRecord) {
    return this.oldExamsService.findOne(id, user);
  }

  @Get(':id/questions')
  findQuestions(
    @paramIntId() id: number,
    @CurrentUser() user: UserRecord,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.oldExamsService.findQuestions(id, page, limit, user);
  }

  @Patch(':id')
  @Roles([Role.Admin])
  update(@paramIntId() id: number, @Body() dto: Partial<CreateOldExamDto>) {
    return this.oldExamsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([Role.Admin])
  async remove(@paramIntId() id: number): Promise<void> {
    await this.oldExamsService.remove(id);
  }
}
