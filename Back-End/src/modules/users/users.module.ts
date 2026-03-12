import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { UsersService } from './users.service';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { UsersController } from './users.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [AdminUsersController, UsersController],
  providers: [UsersService, AdminUsersService],
  exports: [UsersService],
})
export class UsersModule { }
