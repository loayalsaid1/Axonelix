import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ISO_DATE_PATTERN } from './shared';

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
	@Matches(ISO_DATE_PATTERN, { message: 'dueDate must be in YYYY-MM-DD format.' })
	dueDate!: string;
}
