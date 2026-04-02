import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { SubscriptionsController } from './subscriptions.controller';
import { AdminSubscriptionsController } from './admin-subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsAccessService } from './subscriptions-access.service';

@Module({
	imports: [DrizzleModule],
	controllers: [SubscriptionsController, AdminSubscriptionsController],
	providers: [SubscriptionsService, SubscriptionsAccessService],
	exports: [SubscriptionsService, SubscriptionsAccessService],
})
export class SubscriptionsModule { }
