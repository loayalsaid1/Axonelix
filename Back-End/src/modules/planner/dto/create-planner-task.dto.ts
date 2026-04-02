import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsIsoDateOnly } from './shared';

export class CreatePlannerTaskDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title!: string;

	@IsString()
	@IsOptional()
	@MaxLength(5000)
	notes?: string;

	@IsString()
	@IsIsoDateOnly({ message: 'dueDate must be a valid date in YYYY-MM-DD format.' })
	dueDate!: string;
}
