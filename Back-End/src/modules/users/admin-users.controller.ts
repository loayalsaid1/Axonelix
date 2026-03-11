import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { AdminUsersService } from './admin-users.service';
import { AdminUserProfileDto } from './dto/admin-user-profile.dto';

@UseGuards(RolesGuard)
@Roles([Role.Admin])
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) { }

  /** GET /admin/users — all users; pass ?role=student to filter by role */
  @Get()
  findAll(@Query('role') role?: Role): Promise<AdminUserProfileDto[]> {
    return this.adminUsersService.findAllWithProfile(role ? { role } : undefined);
  }

  /** GET /admin/users/students — shorthand for students only */
  @Get('students')
  findStudents(): Promise<AdminUserProfileDto[]> {
    return this.adminUsersService.findStudents();
  }
}
