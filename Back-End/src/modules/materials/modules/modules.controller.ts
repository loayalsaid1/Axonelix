import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto, UpdateModuleDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';

@Controller('materials/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Get(':id')
  findOne(@paramIntId() id: number) {
    return this.modulesService.findOne(id);
  }

  @Get(':id/hierarchy')
  findHierarchy(@paramIntId() id: number) {
    return this.modulesService.findHierarchy(id);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number) {
    await this.modulesService.remove(id);
  }
}
