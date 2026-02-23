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
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('questions/universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
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
  async remove(@paramIntId() id: number): Promise<void> {
    await this.universitiesService.remove(id);
  }
}
