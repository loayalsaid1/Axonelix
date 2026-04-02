import {
	registerDecorator,
	ValidationArguments,
	type ValidationOptions,
} from 'class-validator';

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDateOnly(value: string): boolean {
	if (!ISO_DATE_PATTERN.test(value)) {
		return false;
	}

	const parsed = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function IsIsoDateOnly(validationOptions?: ValidationOptions): PropertyDecorator {
	return (target: object, propertyName: string | symbol) => {
		registerDecorator({
			name: 'isIsoDateOnly',
			target: target.constructor,
			propertyName: propertyName as string,
			options: validationOptions,
			validator: {
				validate(value: unknown): boolean {
					return typeof value === 'string' && isIsoDateOnly(value);
				},
				defaultMessage(args: ValidationArguments): string {
					return `${args.property} must be a valid date in YYYY-MM-DD format.`;
				},
			},
		});
	};
}
