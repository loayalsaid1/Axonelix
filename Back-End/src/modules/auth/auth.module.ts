import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClerkWebhookService } from './clerk-webhook.service';
import { UsersModule } from '../users/users.module';
import { UsersController } from '../users/users.controller';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, UsersController],
  providers: [AuthService, ClerkWebhookService],
  exports: [AuthService],
})
export class AuthModule { }
