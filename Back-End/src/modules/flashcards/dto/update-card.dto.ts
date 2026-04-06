import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-cards.dto';

export class UpdateCardDto extends PartialType(CreateCardDto) { }
