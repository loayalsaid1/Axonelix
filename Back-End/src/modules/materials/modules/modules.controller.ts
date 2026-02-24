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
import { CreateModuleDto, UpdateModuleDto, ModuleResponseDto } from './dto';
import { paramIntId } from '../../../common/decorators/param-int-id.decorator';
import { HierarchyResponseDto } from '../dto/hierarchy-response.dto';

@Controller('materials/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createModuleDto: CreateModuleDto): Promise<ModuleResponseDto> {
    return this.modulesService.create(createModuleDto);
  }

  /** Lightweight list – only id + name, for filter dropdowns. */
  @Get('names')
  findNames(): Promise<{ id: number; name: string }[]> {
    return this.modulesService.findNames();
  }

  @Get()
  findAll(): Promise<ModuleResponseDto[]> {
    return this.modulesService.findAll();
  }

  @Get(':id')
  findOne(@paramIntId() id: number): Promise<ModuleResponseDto> {
    return this.modulesService.findOne(id);
  }

  @Get(':id/hierarchy')
  findHierarchy(@paramIntId() id: number): Promise<HierarchyResponseDto> {
    return this.modulesService.findHierarchy(id);
  }

  @Patch(':id')
  update(
    @paramIntId() id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@paramIntId() id: number): Promise<void> {
    await this.modulesService.remove(id);
  }
}
