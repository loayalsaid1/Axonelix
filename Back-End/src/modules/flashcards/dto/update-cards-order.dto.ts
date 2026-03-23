import { IsArray, IsNumber } from 'class-validator';

export class UpdateCardsOrderDto {
	@IsArray()
	@IsNumber({}, { each: true })
	cardIds: number[];
}
