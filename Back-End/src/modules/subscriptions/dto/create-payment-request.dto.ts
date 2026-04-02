import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreatePaymentRequestDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	moduleId: number;

	@IsUUID()
	proofImageId: string;

	@IsString()
	@IsOptional()
	@MaxLength(1500)
	submitNote?: string;
}
