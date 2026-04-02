import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { CurrentUser, paramIntId } from '../../common/decorators';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { SubscriptionsService } from './subscriptions.service';
import { CreatePaymentRequestDto, ListMyPaymentRequestsDto } from './dto';

@Controller('subscriptions')
export class SubscriptionsController {
	constructor(private readonly subscriptionsService: SubscriptionsService) { }

	@Get('payment-info')
	getPaymentInfo() {
		return this.subscriptionsService.getPaymentInfo();
	}

	@Post('payment-requests')
	@HttpCode(HttpStatus.CREATED)
	createPaymentRequest(
		@CurrentUser() user: UserRecord,
		@Body() dto: CreatePaymentRequestDto,
	) {
		return this.subscriptionsService.createPaymentRequest(user, dto);
	}

	@Get('payment-requests/me')
	listMyPaymentRequests(
		@CurrentUser() user: UserRecord,
		@Query() filters: ListMyPaymentRequestsDto,
	) {
		return this.subscriptionsService.listMyPaymentRequests(user.id, filters);
	}

	@Get('payment-requests/me/:id')
	getMyPaymentRequestById(
		@CurrentUser() user: UserRecord,
		@paramIntId() id: number,
	) {
		return this.subscriptionsService.getMyPaymentRequestById(user.id, id);
	}

	@Patch('payment-requests/me/:id/cancel')
	cancelMyPaymentRequest(
		@CurrentUser() user: UserRecord,
		@paramIntId() id: number,
	) {
		return this.subscriptionsService.cancelMyPaymentRequest(user.id, id);
	}

	@Get('my-modules')
	getMyModules(@CurrentUser() user: UserRecord) {
		return this.subscriptionsService.getMyModules(user.id);
	}
}
