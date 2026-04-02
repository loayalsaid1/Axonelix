import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class GrantUserModuleAccessDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	userId: number;

	@IsInt()
	@Min(1)
	@Type(() => Number)
	moduleId: number;

	@IsString()
	@IsOptional()
	@MaxLength(50)
	source?: string;
}
