import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePlannerTaskDto } from './create-planner-task.dto';

export class UpdatePlannerTaskDto extends PartialType(CreatePlannerTaskDto) {
	@IsBoolean()
	@IsOptional()
	isCompleted?: boolean;
}
