import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class ListUserModuleAccessDto {
	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) => {
		if (value === undefined || value === null || value === '') return undefined;
		if (typeof value === 'boolean') return value;
		if (typeof value === 'string') return value.toLowerCase() === 'true';
		return Boolean(value);
	})
	includeRevoked?: boolean;

	@IsInt()
	@Min(1)
	@Type(() => Number)
	@IsOptional()
	moduleId?: number;

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