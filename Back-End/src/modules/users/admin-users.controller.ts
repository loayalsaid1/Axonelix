import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { AdminUsersService } from './admin-users.service';
import { AdminUserProfileDto } from './dto/admin-user-profile.dto';
import { PaginatedResult } from './users.service';

@UseGuards(RolesGuard)
@Roles([Role.Admin])
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) { }

  /** GET /admin/users?role=student&page=1&limit=20 */
  @Get()
  findAll(
    @Query('role') role?: Role,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<PaginatedResult<AdminUserProfileDto>> {
    return this.adminUsersService.findAllWithProfile(
      role ? { role } : undefined,
      { page: Number(page), limit: Number(limit) },
    );
  }

  /** DELETE /admin/users/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.adminUsersService.deleteUser(id);
  }

  /** GET /admin/users/:id */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AdminUserProfileDto> {
    return this.adminUsersService.findByIdWithProfile(id);
  }

  /** DELETE /admin/users — body: { ids: number[] } */
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkDelete(@Body('ids') ids: number[]): Promise<void> {
    return this.adminUsersService.bulkDeleteUsers(ids);
  }
}
