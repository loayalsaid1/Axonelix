import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import {
	CreatePlannerTaskDto,
	PlannerTaskResponseDto,
	PlannerTasksQueryDto,
	UpdatePlannerTaskDto,
} from './dto';
import { PlannerTaskOwnerGuard } from './guards/planner-task-owner.guard';
import { PlannerService } from './planner.service';

@Controller('planner/tasks')
export class PlannerController {
	constructor(private readonly plannerService: PlannerService) { }

	@Get()
	findAllForCurrentUser(
		@CurrentUser() user: UserRecord,
		@Query() query: PlannerTasksQueryDto,
	): Promise<PlannerTaskResponseDto[]> {
		return this.plannerService.listForUser(user.id, query);
	}

	@Post()
	createForCurrentUser(
		@CurrentUser() user: UserRecord,
		@Body() createPlannerTaskDto: CreatePlannerTaskDto,
	): Promise<PlannerTaskResponseDto> {
		return this.plannerService.createForUser(user.id, createPlannerTaskDto);
	}

	@Patch(':id')
	@UseGuards(PlannerTaskOwnerGuard)
	updateForCurrentUser(
		@Param('id', ParseIntPipe) taskId: number,
		@Body() updatePlannerTaskDto: UpdatePlannerTaskDto,
	): Promise<PlannerTaskResponseDto> {
		return this.plannerService.updateForUser(taskId, updatePlannerTaskDto);
	}

	@Delete(':id')
	@UseGuards(PlannerTaskOwnerGuard)
	removeForCurrentUser(
		@Param('id', ParseIntPipe) taskId: number,
	): Promise<{ success: boolean }> {
		return this.plannerService.removeForUser(taskId);
	}
}
