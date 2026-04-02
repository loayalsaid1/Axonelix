import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class ListMyPaymentRequestsDto {
	@IsEnum(['pending', 'approved', 'rejected', 'canceled'])
	@IsOptional()
	status?: 'pending' | 'approved' | 'rejected' | 'canceled';

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
