import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GlobalModuleAccessDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	moduleId?: number;
}
