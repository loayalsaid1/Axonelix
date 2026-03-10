import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto';
import { paramIntId, Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';

@Controller('questions/universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles([Role.Admin])
  create(@Body() dto: CreateUniversityDto) {
    return this.universitiesService.create(dto);
  }

  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.universitiesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([Role.Admin])
  async remove(@paramIntId() id: number): Promise<void> {
    await this.universitiesService.remove(id);
  }
}
