import {
	IsDefined,
	IsString,
	Validate,
	ValidateIf,
	ValidatorConstraint,
	type ValidationArguments,
	type ValidatorConstraintInterface,
} from 'class-validator';
import { IsIsoDateOnly } from './shared';

@ValidatorConstraint({ name: 'PlannerDateRangeConstraint', async: false })
class PlannerDateRangeConstraint implements ValidatorConstraintInterface {
	validate(_toValue: unknown, args: ValidationArguments): boolean {
		const query = args.object as PlannerTasksQueryDto;

		if (!query.from && !query.to) {
			return true;
		}

		if (!query.from || !query.to) {
			return false;
		}

		return query.from <= query.to;
	}

	defaultMessage(args: ValidationArguments): string {
		const query = args.object as PlannerTasksQueryDto;
		if (!query.from || !query.to) {
			return 'from and to must be provided together.';
		}

		return 'from must be less than or equal to to.';
	}
}

export class PlannerTasksQueryDto {
	@ValidateIf((query: PlannerTasksQueryDto) => query.from !== undefined || query.to !== undefined)
	@IsDefined({ message: 'from and to must be provided together.' })
	@IsString()
	@IsIsoDateOnly({ message: 'from must be a valid date in YYYY-MM-DD format.' })
	from?: string;

	@ValidateIf((query: PlannerTasksQueryDto) => query.from !== undefined || query.to !== undefined)
	@IsDefined({ message: 'from and to must be provided together.' })
	@IsString()
	@IsIsoDateOnly({ message: 'to must be a valid date in YYYY-MM-DD format.' })
	@Validate(PlannerDateRangeConstraint)
	to?: string;
}
