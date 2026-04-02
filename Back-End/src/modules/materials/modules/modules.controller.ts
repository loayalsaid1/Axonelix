import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CreateModuleDto, UpdateModuleDto, ModuleResponseDto } from './dto';
import { CurrentUser, paramIntId, Roles } from '../../../common/decorators';
import { Role } from '../../../common/enums';
import { HierarchyResponseDto } from '../dto/hierarchy-response.dto';
import type { UserRecord } from '../../users/interfaces/user-record.interface';

@Controller('materials/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles([Role.Admin])
  create(@Body() createModuleDto: CreateModuleDto): Promise<ModuleResponseDto> {
    return this.modulesService.create(createModuleDto);
  }

  /** Lightweight list – only id + name, for filter dropdowns. */
  @Get('names')
  findNames(
    @CurrentUser() user: UserRecord,
    @Query('includeAccess') includeAccess?: string,
  ): Promise<Array<{ id: number; name: string; accessStatus?: 'owned' | 'locked' }>> {
    return this.modulesService.findNames(user, includeAccess === 'true');
  }

  @Get()
  findAll(
    @CurrentUser() user: UserRecord,
    @Query('includeAccess') includeAccess?: string,
  ): Promise<ModuleResponseDto[]> {
    return this.modulesService.findAll(user, includeAccess === 'true');
  }

  @Get(':id')
  findOne(
    @paramIntId() id: number,
    @CurrentUser() user: UserRecord,
    @Query('includeAccess') includeAccess?: string,
  ): Promise<ModuleResponseDto> {
    return this.modulesService.findOne(id, user, includeAccess === 'true');
  }

  @Get(':id/hierarchy')
  findHierarchy(
    @paramIntId() id: number,
    @CurrentUser() user: UserRecord,
    @Query('includeAccess') includeAccess?: string,
  ): Promise<HierarchyResponseDto> {
    return this.modulesService.findHierarchy(id, user, includeAccess === 'true');
  }

  @Patch(':id')
  @Roles([Role.Admin])
  update(
    @paramIntId() id: number,
    @Body() updateModuleDto: UpdateModuleDto,
  ): Promise<ModuleResponseDto> {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles([Role.Admin])
  async remove(@paramIntId() id: number): Promise<void> {
    await this.modulesService.remove(id);
  }
}
