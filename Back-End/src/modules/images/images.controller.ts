import { Controller, Post, Get, Body } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageRecordDto } from './dto/create-image.dto';
import { CurrentUser } from '../../common/decorators';
import type { UserRecord } from '../users/interfaces/user-record.interface';

@Controller('images')
export class ImagesController {
	constructor(private readonly imagesService: ImagesService) { }

	/**
	 * Generates ImageKit authentication parameters for the client.
	 */
	@Get('imagekit_auth')
	generateImageKitAuth() {
		return this.imagesService.generateImageKitAuth();
	}

	/**
	 * Called by the client right after a successful upload to ImageKit.
	 * Saves the image as PENDING.
	 */
	@Post()
	async recordUploadedImage(
		@Body() dto: CreateImageRecordDto,
		@CurrentUser() user: UserRecord,
	) {
		return this.imagesService.recordNewUpload(dto, user.id);
	}
}
