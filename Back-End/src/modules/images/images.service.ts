import { Injectable, Logger } from '@nestjs/common';
import { CreateImageRecordDto } from './dto/create-image.dto';
import { eq, inArray, and, notInArray } from 'drizzle-orm';
import { images } from '../../database/entities/images';
import { type DRIZZLE_PROVIDER, DrizzleService } from '../../database/drizzle.service';
import ImageKit from '@imagekit/nodejs';
import { ConfigService } from '@nestjs/config';

type ImageEntityType = 'lesson' | 'question' | 'explanation' | 'payment_proof';
type DrizzleTx = Parameters<Parameters<DRIZZLE_PROVIDER['transaction']>[0]>[0];
type DbOrTx = DRIZZLE_PROVIDER | DrizzleTx;

@Injectable()
export class ImagesService {
	public readonly imagekit: ImageKit;
	private readonly logger = new Logger(ImagesService.name);

	constructor(
		private readonly drizzleService: DrizzleService,
		private readonly configService: ConfigService,
	) {
		// Initialize ImageKit with environment variables
		this.imagekit = new ImageKit({
			privateKey: this.configService.getOrThrow<string>('IMAGEKIT_PRIVATE_KEY'),
		});
	}

	generateImageKitAuth() {
		return this.imagekit.helper.getAuthenticationParameters();
	}

	async deleteImageFromProvider(fileId: string): Promise<void> {
		await this.imagekit.files.delete(fileId);
	}

	/**
	 * Save a newly uploaded image metadata as PENDING.
	 */
	async recordNewUpload(dto: CreateImageRecordDto, userId: number | null) {
		const [inserted] = await this.drizzleService.db
			.insert(images)
			.values({
				url: dto.url,
				imagekitFileId: dto.imagekitFileId,
				uploadedBy: userId,
				status: 'pending',
			})
			.returning();

		return inserted;
	}

	/**
	 * Called during entity creation/update (e.g. Lesson).
	 * Finds all pending/committed images matching the src URLs and marks them committed to this entity.
	 */
	async commitImages(
		entityType: ImageEntityType,
		entityId: number,
		urls: string[],
		db: DbOrTx = this.drizzleService.db,
	) {
		if (!urls || urls.length === 0) return;
		const normalizedUrls = Array.from(new Set(urls));

		await db
			.update(images)
			.set({
				status: 'committed',
				entityType: entityType,
				entityId,
				deletedAt: null,
			})
			.where(
				and(
					inArray(images.url, normalizedUrls),
					inArray(images.status, ['pending', 'committed']),
				),
			);
	}

	/**
	 * Compares currently committed URLs in the DB against new URLs.
	 * If an image is missing in newUrls, it marks it as DELETED.
	 */
	async markDeletedByDiff(
		entityType: ImageEntityType,
		entityId: number,
		newUrls: string[],
		db: DbOrTx = this.drizzleService.db,
	) {
		const baseWhere = and(
			eq(images.entityType, entityType),
			eq(images.entityId, entityId),
			eq(images.status, 'committed'),
		);

		const whereClause =
			newUrls.length === 0
				? baseWhere
				: and(baseWhere, notInArray(images.url, newUrls));

		await db
			.update(images)
			.set({
				status: 'deleted',
				deletedAt: new Date().toISOString(),
			})
			.where(whereClause);
	}

	/**
	 * Fully deletes all images associated with an entity.
	 * Marked as DELETED so the cron job picks them up.
	 */
	async deleteAllForEntity(
		entityType: ImageEntityType,
		entityId: number,
		db: DbOrTx = this.drizzleService.db,
	) {
		await db
			.update(images)
			.set({
				status: 'deleted',
				deletedAt: new Date().toISOString(),
			})
			.where(
				and(
					eq(images.entityType, entityType),
					eq(images.entityId, entityId)
				)
			);
	}
}
