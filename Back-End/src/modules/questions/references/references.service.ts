import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../../../database/drizzle.service';
import { questionReferences } from '../../../database/entities/question-references';
import { eq, ilike } from 'drizzle-orm';
import { CreateReferenceDto, ReferenceDto } from './dto/reference.dto';

@Injectable()
export class ReferencesService {
	constructor(private readonly drizzle: DrizzleService) { }

	async findAll() {
		return this.drizzle.db.select({
			id: questionReferences.id,
			name: questionReferences.name,
		}).from(questionReferences).orderBy(questionReferences.name);
	}

	async findOne(id: number) {
		const [ref] = await this.drizzle.db
			.select()
			.from(questionReferences)
			.where(eq(questionReferences.id, id));
		if (!ref) return null;
		return ref;
	}

	async create(dto: CreateReferenceDto) {
		const [newRef] = await this.drizzle.db
			.insert(questionReferences)
			.values({ name: dto.name })
			.returning();
		return newRef;
	}

	/**
	 * Resolves a reference from the UI's ReferenceDto.
	 * If ID is provided, it verifies existence.
	 * If only text is provided, it finds or creates a reference with that name (case-insensitive).
	 */
	async resolve(refDto?: ReferenceDto, tx?: any): Promise<number | null> {
		if (!refDto) return null;
		const { id, text } = refDto;

		const db = tx || this.drizzle.db;

		if (id) {
			const existing = await this.findOne(id);
			return existing?.id ?? null;
		}

		if (text) {
			const trimmedText = text.trim();
			if (!trimmedText) return null;

			// Try finding existing (case-insensitive)
			const [existing] = await db
				.select({ id: questionReferences.id })
				.from(questionReferences)
				.where(ilike(questionReferences.name, trimmedText));

			if (existing) return existing.id;

			// Create new
			const [newRef] = await db
				.insert(questionReferences)
				.values({ name: trimmedText })
				.returning({ id: questionReferences.id });

			return newRef.id;
		}

		return null;
	}
}
