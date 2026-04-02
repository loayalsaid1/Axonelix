import { Type } from 'class-transformer';
import {
	IsDateString,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	MaxLength,
	Min,
} from 'class-validator';

export class ListPaymentRequestsDto {
	@IsEnum(['pending', 'approved', 'rejected', 'canceled'])
	@IsOptional()
	status?: 'pending' | 'approved' | 'rejected' | 'canceled';

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

	@IsInt()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	page?: number;

	@IsInt()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	limit?: number;
}
