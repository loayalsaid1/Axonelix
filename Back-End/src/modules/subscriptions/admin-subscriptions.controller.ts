import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { paramIntId, Roles } from '../../common/decorators';
import { Role } from '../../common/enums';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { SubscriptionsService } from './subscriptions.service';
import {
	GlobalModuleAccessDto,
	GrantUserModuleAccessDto,
	ListPaymentRequestsDto,
	ListUserModuleAccessDto,
	PaymentRequestStatsDto,
	ReviewPaymentRequestDto,
} from './dto';

@Controller('admin/subscriptions')
@Roles([Role.Admin])
export class AdminSubscriptionsController {
	constructor(private readonly subscriptionsService: SubscriptionsService) { }

	@Get('payment-requests')
	listPaymentRequests(@Query() filters: ListPaymentRequestsDto) {
		return this.subscriptionsService.listPaymentRequests(filters);
	}

	@Get('payment-requests/stats')
	getPaymentRequestStats(@Query() filters: PaymentRequestStatsDto) {
		return this.subscriptionsService.getPaymentRequestStats(filters);
	}

	@Get('payment-requests/:id')
	getPaymentRequest(@paramIntId() id: number) {
		return this.subscriptionsService.getPaymentRequestById(id);
	}

	@Get('user-access/:userId')
	listUserAccess(
		@Param('userId', ParseIntPipe) userId: number,
		@Query() filters: ListUserModuleAccessDto,
	) {
		return this.subscriptionsService.listUserModuleAccess(userId, filters);
	}

	@Patch('payment-requests/:id/review')
	reviewPaymentRequest(
		@paramIntId() id: number,
		@CurrentUser() user: UserRecord,
		@Body() dto: ReviewPaymentRequestDto,
	) {
		return this.subscriptionsService.reviewPaymentRequest(id, user.id, dto);
	}

	@Post('user-access/grant')
	@HttpCode(HttpStatus.CREATED)
	grantUserAccess(
		@CurrentUser() user: UserRecord,
		@Body() dto: GrantUserModuleAccessDto,
	) {
		return this.subscriptionsService.grantUserModuleAccess(dto, user.id);
	}

	@Post('user-access/grant-global')
	@HttpCode(HttpStatus.OK)
	grantGlobalAccess(
		@CurrentUser() user: UserRecord,
		@Body() dto: GlobalModuleAccessDto,
	) {
		return this.subscriptionsService.grantGlobalModuleAccess(dto, user.id);
	}

	@Delete('user-access/:userId/:moduleId')
	@HttpCode(HttpStatus.OK)
	revokeUserAccess(
		@Param('userId', ParseIntPipe) userId: number,
		@Param('moduleId', ParseIntPipe) moduleId: number,
	) {
		return this.subscriptionsService.revokeUserModuleAccess(userId, moduleId);
	}

	@Post('user-access/revoke-global')
	@HttpCode(HttpStatus.OK)
	revokeGlobalAccess(
		@CurrentUser() user: UserRecord,
		@Body() dto: GlobalModuleAccessDto,
	) {
		return this.subscriptionsService.revokeGlobalModuleAccess(dto, user.id);
	}
}
