import { IsOptional, IsString, Matches } from 'class-validator';
import { ISO_DATE_PATTERN } from './shared';

export class PlannerTasksQueryDto {
	@IsString()
	@IsOptional()
	@Matches(ISO_DATE_PATTERN, { message: 'from must be in YYYY-MM-DD format.' })
	from?: string;

	@IsString()
	@IsOptional()
	@Matches(ISO_DATE_PATTERN, { message: 'to must be in YYYY-MM-DD format.' })
	to?: string;
}
