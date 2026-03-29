import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, and, lt } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { images } from '../../database/entities/images';
import { ImagesService } from './images.service';

@Injectable()
export class ImagesCronService {
	private readonly logger = new Logger(ImagesCronService.name);

	constructor(
		private readonly drizzleService: DrizzleService,
		private readonly imagesService: ImagesService
	) { }
	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
	async handleImageCleanup() {
		this.logger.log('Starting image cleanup cron job...');

		try {
			// Calculate date 24 hours ago
			const yesterday = new Date();
			// postgres timestamps in Drizzle are often strings depending on mode, 
			// but Drizzle sql helper handles DATE objects nicely if mode=string.
			yesterday.setHours(yesterday.getHours() - 24);
			const yesterdayStr = yesterday.toISOString();

			// 1. Find stale pending images
			const stalePending = await this.drizzleService.db
				.select()
				.from(images)
				.where(
					and(
						eq(images.status, 'pending'),
						lt(images.createdAt, yesterdayStr)
					)
				);

			// 2. Find explicitly deleted images (we could add grace period too)
			const deletedImages = await this.drizzleService.db
				.select()
				.from(images)
				.where(eq(images.status, 'deleted'));

			const toDelete = [...stalePending, ...deletedImages];

			if (toDelete.length === 0) {
				this.logger.log('No images to clean up.');
				return;
			}

			this.logger.log(`Found ${toDelete.length} images to hard-delete.`);

			// 3. For each one, delete from ImageKit using actual SDK
			for (const img of toDelete) {
				try {
					this.logger.debug(`Deleting file ${img.imagekitFileId} from ImageKit`);

					await this.imagesService.deleteImageFromProvider(img.imagekitFileId);

					// 4. Hard delete from DB
					await this.drizzleService.db
						.delete(images)
						.where(eq(images.id, img.id));

				} catch (err) {
					this.logger.error(`Failed to delete image ${img.id} (FileID: ${img.imagekitFileId})`, err);
				}
			}

			this.logger.log('Image cleanup cron job finished.');
		} catch (error) {
			this.logger.error('Failed to run image cleanup cron job.', error);
		}
	}
}
