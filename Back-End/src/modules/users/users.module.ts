import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { UsersService } from './users.service';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [AdminUsersController],
  providers: [UsersService, AdminUsersService],
  exports: [UsersService],
})
export class UsersModule { }
