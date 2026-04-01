import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class PaymentRequestStatsDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	moduleId?: number;

	@IsInt()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	userId?: number;

	@IsDateString()
	@IsOptional()
	fromDate?: string;

	@IsDateString()
	@IsOptional()
	toDate?: string;

	@IsString()
	@MaxLength(200)
	@IsOptional()
	query?: string;
}
