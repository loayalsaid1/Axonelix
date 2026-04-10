import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { userModuleAccess } from '../../../database/entities/user-module-access';

type UserModuleAccessInsert = typeof userModuleAccess.$inferInsert;

export class GrantUserModuleAccessDto {
	@IsInt()
	@Min(1)
	@Type(() => Number)
	userId!: UserModuleAccessInsert['userId'];

	@IsInt()
	@Min(1)
	@Type(() => Number)
	moduleId!: UserModuleAccessInsert['moduleId'];

	@IsString()
	@IsOptional()
	@MaxLength(50)
	source?: UserModuleAccessInsert['source'];
}
