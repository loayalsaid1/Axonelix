import { IsString, IsNotEmpty, IsUrl } from 'class-validator';
import { images } from '../../../database/entities/images';

type ImageInsert = typeof images.$inferInsert;

export class CreateImageRecordDto {
	@IsUrl()
	@IsNotEmpty()
	url: ImageInsert['url'];

	@IsString()
	@IsNotEmpty()
	imagekitFileId: ImageInsert['imagekitFileId'];
}
