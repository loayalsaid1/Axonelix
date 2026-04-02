import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	asc,
	and,
	count,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	isNull,
	lt,
	lte,
	or,
	SQL,
	sql,
} from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { modulePaymentRequests } from '../../database/entities/module-payment-requests';
import { modulePaymentRequestEvents } from '../../database/entities/module-payment-request-events';
import { userModuleAccess } from '../../database/entities/user-module-access';
import { modules } from '../../database/entities/modules';
import { users } from '../../database/entities/users';
import { images } from '../../database/entities/images';
import { Role } from '../../common/enums';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import {
	CreatePaymentRequestDto,
	GlobalModuleAccessDto,
	GrantUserModuleAccessDto,
	ListMyPaymentRequestsDto,
	ListPaymentRequestsDto,
	PaymentReviewAction,
	PaymentRequestStatsDto,
	ReviewPaymentRequestDto,
} from './dto';
import { ConfigService } from '@nestjs/config';

const MODULE_FEE_PIASTERS = 20000;

@Injectable()
export class SubscriptionsService {
	constructor(
		private readonly drizzleService: DrizzleService,
		private readonly configService: ConfigService
	) { }

	// This is the furthest that could be from SOLID
	// And this is the price you make when for the first time you don't write detailed
	// plan enough for your model that writes the code
	getPaymentInfo() {
		return {
			moduleFeePounds: MODULE_FEE_PIASTERS / 100,
			moduleFeePiasters: MODULE_FEE_PIASTERS,
			currency: 'EGP',
			paymentMethod: 'instapay',
			instapayHandle: this.configService.getOrThrow('INSTAPAY_HANDLE'),
			instapayQrCodeUrl: this.configService.getOrThrow('INSTAPAY_QR_IMAGE_URL'),
		};
	}

	async createPaymentRequest(user: UserRecord, dto: CreatePaymentRequestDto) {
		await this.assertModuleExists(dto.moduleId);

		const [activeAccess] = await this.drizzleService.db
			.select({ id: userModuleAccess.id })
			.from(userModuleAccess)
			.where(
				and(
					eq(userModuleAccess.userId, user.id),
					eq(userModuleAccess.moduleId, dto.moduleId),
					isNull(userModuleAccess.revokedAt),
				),
			)
			.limit(1);

		if (activeAccess) {
			throw new ConflictException('You already own this module');
		}

		const [pendingRequest] = await this.drizzleService.db
			.select({ id: modulePaymentRequests.id })
			.from(modulePaymentRequests)
			.where(
				and(
					eq(modulePaymentRequests.userId, user.id),
					eq(modulePaymentRequests.moduleId, dto.moduleId),
					eq(modulePaymentRequests.status, 'pending'),
				),
			)
			.limit(1);

		if (pendingRequest) {
			throw new ConflictException('You already have a pending payment request for this module');
		}

		return this.drizzleService.db.transaction(async (tx) => {
			const [created] = await tx
				.insert(modulePaymentRequests)
				.values({
					userId: user.id,
					moduleId: dto.moduleId,
					status: 'pending',
					proofImageId: dto.proofImageId,
					submitNote: dto.submitNote ?? null,
					moduleFeePiasters: MODULE_FEE_PIASTERS,
				})
				.returning();

			const [committedImage] = await tx
				.update(images)
				.set({
					status: 'committed',
					entityType: 'payment_proof',
					entityId: created.id,
					deletedAt: null,
				})
				.where(
					and(
						eq(images.id, dto.proofImageId),
						eq(images.uploadedBy, user.id),
						eq(images.status, 'pending'),
					),
				)
				.returning({ id: images.id });

			if (!committedImage) {
				throw new BadRequestException('Invalid proof image. Upload and submit again.');
			}

			await tx.insert(modulePaymentRequestEvents).values({
				paymentRequestId: created.id,
				fromStatus: null,
				toStatus: 'pending',
				actorUserId: user.id,
				note: dto.submitNote ?? null,
			});

			return created;
		});
	}

	async listMyPaymentRequests(
		userId: number,
		filters: ListMyPaymentRequestsDto = {},
	) {
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;
		const conditions: SQL[] = [eq(modulePaymentRequests.userId, userId)];

		if (filters.status) {
			conditions.push(eq(modulePaymentRequests.status, filters.status));
		}

		const where = this.combineConditions(...conditions);

		const [data, [{ value: total }]] = await Promise.all([
			this.drizzleService.db.query.modulePaymentRequests.findMany({
				where,
				orderBy: (r, { desc }) => [desc(r.createdAt)],
				limit,
				offset,
				with: {
					module: { columns: { id: true, name: true } },
					proofImage: { columns: { id: true, url: true, status: true } },
					reviewedByUser: { columns: { id: true, email: true } },
				},
			}),
			this.drizzleService.db
				.select({ value: count() })
				.from(modulePaymentRequests)
				.where(where),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getMyPaymentRequestById(userId: number, id: number) {
		const request = await this.drizzleService.db.query.modulePaymentRequests.findFirst({
			where: and(
				eq(modulePaymentRequests.id, id),
				eq(modulePaymentRequests.userId, userId),
			),
			with: {
				user: { columns: { id: true, email: true } },
				module: { columns: { id: true, name: true, description: true } },
				proofImage: { columns: { id: true, url: true, status: true } },
				reviewedByUser: { columns: { id: true, email: true } },
				events: {
					orderBy: (e, { asc }) => [asc(e.createdAt)],
					with: {
						actorUser: { columns: { id: true, email: true } },
					},
				},
			},
		});

		if (!request) {
			throw new NotFoundException(`Payment request ${id} not found`);
		}

		return request;
	}

	async getMyModules(userId: number) {
		return this.drizzleService.db.query.userModuleAccess.findMany({
			where: and(
				eq(userModuleAccess.userId, userId),
				isNull(userModuleAccess.revokedAt),
			),
			orderBy: (a, { desc }) => [desc(a.grantedAt)],
			with: {
				module: {
					columns: { id: true, name: true, description: true, orderIndex: true },
				},
			},
		});
	}

	async listPaymentRequests(filters: ListPaymentRequestsDto) {
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const offset = (page - 1) * limit;

		const conditions = this.buildPaymentRequestScopedConditions(filters);

		if (filters.status) {
			conditions.push(eq(modulePaymentRequests.status, filters.status));
		}

		const where = this.combineConditions(...conditions);

		const [data, [{ value: total }]] = await Promise.all([
			this.drizzleService.db.query.modulePaymentRequests.findMany({
				where,
				orderBy: (r, { desc }) => [desc(r.createdAt)],
				limit,
				offset,
				with: {
					user: { columns: { id: true, email: true } },
					module: { columns: { id: true, name: true } },
					proofImage: { columns: { id: true, url: true, status: true } },
					reviewedByUser: { columns: { id: true, email: true } },
				},
			}),
			this.drizzleService.db
				.select({ value: count() })
				.from(modulePaymentRequests)
				.where(where),
		]);

		return {
			data,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
		};
	}

	async getPaymentRequestStats(filters: PaymentRequestStatsDto = {}) {
		const scopeConditions = this.buildPaymentRequestScopedConditions(filters);

		const staleCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
		const todayStart = new Date();
		todayStart.setUTCHours(0, 0, 0, 0);

		const pendingWhere = this.combineConditions(
			...scopeConditions,
			eq(modulePaymentRequests.status, 'pending'),
		);

		const approvedTodayWhere = this.combineConditions(
			...scopeConditions,
			eq(modulePaymentRequests.status, 'approved'),
			gte(modulePaymentRequests.reviewedAt, todayStart.toISOString()),
		);

		const approvedWhere = this.combineConditions(
			...scopeConditions,
			eq(modulePaymentRequests.status, 'approved'),
		);

		const flaggedWhere = this.combineConditions(
			...scopeConditions,
			eq(modulePaymentRequests.status, 'pending'),
			or(
				isNull(modulePaymentRequests.proofImageId),
				lt(modulePaymentRequests.createdAt, staleCutoff),
			),
		);

		const [
			[{ value: pendingReview }],
			[{ value: approvedToday }],
			[{ value: flaggedRequests }],
			[{ value: totalApprovedVolumePiastersRaw }],
		] = await Promise.all([
			this.drizzleService.db
				.select({ value: count() })
				.from(modulePaymentRequests)
				.where(pendingWhere),
			this.drizzleService.db
				.select({ value: count() })
				.from(modulePaymentRequests)
				.where(approvedTodayWhere),
			this.drizzleService.db
				.select({ value: count() })
				.from(modulePaymentRequests)
				.where(flaggedWhere),
			this.drizzleService.db
				.select({
					value: sql<string>`COALESCE(SUM(${modulePaymentRequests.moduleFeePiasters}), 0)`,
				})
				.from(modulePaymentRequests)
				.where(approvedWhere),
		]);

		const totalApprovedVolumePiasters = Number(totalApprovedVolumePiastersRaw ?? 0);

		return {
			pendingReview,
			approvedToday,
			totalApprovedVolumePiasters,
			totalApprovedVolumePounds: totalApprovedVolumePiasters / 100,
			flaggedRequests,
			currency: 'EGP',
			generatedAt: new Date().toISOString(),
		};
	}

	async cancelMyPaymentRequest(userId: number, id: number) {
		await this.drizzleService.db.transaction(async (tx) => {
			const [updated] = await tx
				.update(modulePaymentRequests)
				.set({ status: 'canceled' })
				.where(
					and(
						eq(modulePaymentRequests.id, id),
						eq(modulePaymentRequests.userId, userId),
						eq(modulePaymentRequests.status, 'pending'),
					),
				)
				.returning({ id: modulePaymentRequests.id });

			if (!updated) {
				const [existing] = await tx
					.select({
						id: modulePaymentRequests.id,
						status: modulePaymentRequests.status,
						ownerId: modulePaymentRequests.userId,
					})
					.from(modulePaymentRequests)
					.where(eq(modulePaymentRequests.id, id))
					.limit(1);

				if (!existing || existing.ownerId !== userId) {
					throw new NotFoundException(`Payment request ${id} not found`);
				}

				throw new ConflictException(
					`Only pending requests can be canceled. Current status: ${existing.status}`,
				);
			}

			await tx.insert(modulePaymentRequestEvents).values({
				paymentRequestId: id,
				fromStatus: 'pending',
				toStatus: 'canceled',
				actorUserId: userId,
				note: 'Canceled by student',
			});
		});

		return this.getMyPaymentRequestById(userId, id);
	}

	async getPaymentRequestById(id: number) {
		const request = await this.drizzleService.db.query.modulePaymentRequests.findFirst({
			where: eq(modulePaymentRequests.id, id),
			with: {
				user: { columns: { id: true, email: true } },
				module: { columns: { id: true, name: true, description: true } },
				proofImage: { columns: { id: true, url: true, status: true } },
				reviewedByUser: { columns: { id: true, email: true } },
				events: {
					orderBy: (e, { asc }) => [asc(e.createdAt)],
					with: {
						actorUser: { columns: { id: true, email: true } },
					},
				},
			},
		});

		if (!request) {
			throw new NotFoundException(`Payment request ${id} not found`);
		}

		return request;
	}

	async reviewPaymentRequest(
		id: number,
		reviewerId: number,
		dto: ReviewPaymentRequestDto,
	) {
		const targetStatus =
			dto.action === PaymentReviewAction.Approve ? 'approved' : 'rejected';

		await this.drizzleService.db.transaction(async (tx) => {
			const [updated] = await tx
				.update(modulePaymentRequests)
				.set({
					status: targetStatus,
					reviewNote: dto.reviewNote ?? null,
					reviewedBy: reviewerId,
					reviewedAt: new Date().toISOString(),
				})
				.where(
					and(
						eq(modulePaymentRequests.id, id),
						eq(modulePaymentRequests.status, 'pending'),
					),
				)
				.returning();

			if (!updated) {
				const [existing] = await tx
					.select({ id: modulePaymentRequests.id, status: modulePaymentRequests.status })
					.from(modulePaymentRequests)
					.where(eq(modulePaymentRequests.id, id))
					.limit(1);

				if (!existing) {
					throw new NotFoundException(`Payment request ${id} not found`);
				}

				throw new ConflictException(
					`Only pending requests can be reviewed. Current status: ${existing.status}`,
				);
			}

			if (targetStatus === 'approved') {
				const [existingAccess] = await tx
					.select({ id: userModuleAccess.id })
					.from(userModuleAccess)
					.where(
						and(
							eq(userModuleAccess.userId, updated.userId),
							eq(userModuleAccess.moduleId, updated.moduleId),
							isNull(userModuleAccess.revokedAt),
						),
					)
					.limit(1);

				if (!existingAccess) {
					await tx.insert(userModuleAccess).values({
						userId: updated.userId,
						moduleId: updated.moduleId,
						source: 'manual_payment',
						grantedBy: reviewerId,
					});
				}
			}

			await tx.insert(modulePaymentRequestEvents).values({
				paymentRequestId: updated.id,
				fromStatus: 'pending',
				toStatus: targetStatus,
				actorUserId: reviewerId,
				note: dto.reviewNote ?? null,
			});
		});

		return this.getPaymentRequestById(id);
	}

	async grantUserModuleAccess(dto: GrantUserModuleAccessDto, adminId: number) {
		await Promise.all([
			this.assertUserExists(dto.userId),
			this.assertModuleExists(dto.moduleId),
		]);

		const [existing] = await this.drizzleService.db
			.select({ id: userModuleAccess.id })
			.from(userModuleAccess)
			.where(
				and(
					eq(userModuleAccess.userId, dto.userId),
					eq(userModuleAccess.moduleId, dto.moduleId),
					isNull(userModuleAccess.revokedAt),
				),
			)
			.limit(1);

		if (existing) {
			return { granted: false, reason: 'already_active' };
		}

		const [created] = await this.drizzleService.db
			.insert(userModuleAccess)
			.values({
				userId: dto.userId,
				moduleId: dto.moduleId,
				source: dto.source ?? 'manual_grant',
				grantedBy: adminId,
			})
			.returning();

		return { granted: true, access: created };
	}

	async revokeUserModuleAccess(userId: number, moduleId: number) {
		const revokedAt = new Date().toISOString();

		const rows = await this.drizzleService.db
			.update(userModuleAccess)
			.set({ revokedAt })
			.where(
				and(
					eq(userModuleAccess.userId, userId),
					eq(userModuleAccess.moduleId, moduleId),
					isNull(userModuleAccess.revokedAt),
				),
			)
			.returning({ id: userModuleAccess.id });

		if (!rows.length) {
			throw new NotFoundException(
				`No active module access found for user ${userId} and module ${moduleId}`,
			);
		}

		return { revoked: rows.length };
	}

	async grantGlobalModuleAccess(dto: GlobalModuleAccessDto = {}, adminId: number) {
		if (dto.moduleId != null) {
			await this.assertModuleExists(dto.moduleId);
		}

		const source = dto.moduleId != null
			? 'global_admin_grant_module'
			: 'global_admin_grant_all';

		const query = dto.moduleId != null
			? sql`
				INSERT INTO "user_module_access" ("user_id", "module_id", "source", "granted_by")
				SELECT u."id", ${dto.moduleId}, ${source}, ${adminId}
				FROM "users" AS u
				WHERE u."role" = ${Role.Student}
				ON CONFLICT ("user_id", "module_id") WHERE "revoked_at" IS NULL DO NOTHING
				RETURNING "user_id"
			`
			: sql`
				INSERT INTO "user_module_access" ("user_id", "module_id", "source", "granted_by")
				SELECT u."id", m."id", ${source}, ${adminId}
				FROM "users" AS u
				CROSS JOIN "modules" AS m
				WHERE u."role" = ${Role.Student}
				ON CONFLICT ("user_id", "module_id") WHERE "revoked_at" IS NULL DO NOTHING
				RETURNING "user_id"
			`;

		const result = await this.drizzleService.db.execute(query);
		const userIds = this.extractAffectedUserIds(result.rows);

		return {
			action: 'grant' as const,
			scope: dto.moduleId != null ? ('single_module' as const) : ('all_modules' as const),
			moduleId: dto.moduleId ?? null,
			affectedAccessRows: result.rows.length,
			affectedUsers: new Set(userIds).size,
			performedBy: adminId,
			performedAt: new Date().toISOString(),
		};
	}

	async revokeGlobalModuleAccess(dto: GlobalModuleAccessDto = {}, adminId: number) {
		if (dto.moduleId != null) {
			await this.assertModuleExists(dto.moduleId);
		}

		const revokedAt = new Date().toISOString();

		const query = dto.moduleId != null
			? sql`
				UPDATE "user_module_access" AS uma
				SET "revoked_at" = ${revokedAt}
				FROM "users" AS u
				WHERE uma."user_id" = u."id"
					AND u."role" = ${Role.Student}
					AND uma."revoked_at" IS NULL
					AND uma."module_id" = ${dto.moduleId}
				RETURNING uma."user_id"
			`
			: sql`
				UPDATE "user_module_access" AS uma
				SET "revoked_at" = ${revokedAt}
				FROM "users" AS u
				WHERE uma."user_id" = u."id"
					AND u."role" = ${Role.Student}
					AND uma."revoked_at" IS NULL
				RETURNING uma."user_id"
			`;

		const result = await this.drizzleService.db.execute(query);
		const userIds = this.extractAffectedUserIds(result.rows);

		return {
			action: 'revoke' as const,
			scope: dto.moduleId != null ? ('single_module' as const) : ('all_modules' as const),
			moduleId: dto.moduleId ?? null,
			affectedAccessRows: result.rows.length,
			affectedUsers: new Set(userIds).size,
			performedBy: adminId,
			performedAt: new Date().toISOString(),
		};
	}

	private combineConditions(...conditions: Array<SQL | undefined>): SQL | undefined {
		const valid = conditions.filter((condition): condition is SQL => Boolean(condition));
		if (!valid.length) return undefined;
		if (valid.length === 1) return valid[0];
		return and(...valid) ?? undefined;
	}

	private extractAffectedUserIds(rows: unknown[]): number[] {
		return rows
			.map((row) => {
				if (!row || typeof row !== 'object') return null;
				const value = (row as { user_id?: unknown }).user_id;
				if (typeof value === 'number') return value;
				if (typeof value === 'string') {
					const parsed = Number(value);
					return Number.isFinite(parsed) ? parsed : null;
				}
				return null;
			})
			.filter((value): value is number => value != null);
	}

	private parseDateFilter(raw?: string, asEndOfDay = false): string | undefined {
		if (!raw) return undefined;

		const parsed = new Date(raw);
		if (Number.isNaN(parsed.getTime())) return undefined;

		if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
			if (asEndOfDay) {
				parsed.setUTCHours(23, 59, 59, 999);
			} else {
				parsed.setUTCHours(0, 0, 0, 0);
			}
		}

		return parsed.toISOString();
	}

	private buildSearchCondition(rawQuery?: string): SQL | undefined {
		const query = rawQuery?.trim();
		if (!query) return undefined;

		const likePattern = `%${query}%`;
		const parsedRequestId = Number(query);

		const searchClauses: SQL[] = [
			inArray(
				modulePaymentRequests.userId,
				this.drizzleService.db
					.select({ id: users.id })
					.from(users)
					.where(ilike(users.email, likePattern)),
			),
			inArray(
				modulePaymentRequests.moduleId,
				this.drizzleService.db
					.select({ id: modules.id })
					.from(modules)
					.where(ilike(modules.name, likePattern)),
			),
		];

		if (Number.isInteger(parsedRequestId) && parsedRequestId > 0) {
			searchClauses.push(eq(modulePaymentRequests.id, parsedRequestId));
		}

		return or(...searchClauses) ?? undefined;
	}

	private buildPaymentRequestScopedConditions(filters: {
		moduleId?: number;
		userId?: number;
		fromDate?: string;
		toDate?: string;
		query?: string;
	}): SQL[] {
		const conditions: SQL[] = [];

		if (filters.moduleId != null) {
			conditions.push(eq(modulePaymentRequests.moduleId, filters.moduleId));
		}
		if (filters.userId != null) {
			conditions.push(eq(modulePaymentRequests.userId, filters.userId));
		}

		const fromDate = this.parseDateFilter(filters.fromDate, false);
		const toDate = this.parseDateFilter(filters.toDate, true);

		if (fromDate) {
			conditions.push(gte(modulePaymentRequests.createdAt, fromDate));
		}
		if (toDate) {
			conditions.push(lte(modulePaymentRequests.createdAt, toDate));
		}

		const searchCondition = this.buildSearchCondition(filters.query);
		if (searchCondition) {
			conditions.push(searchCondition);
		}

		return conditions;
	}

	private async assertModuleExists(moduleId: number): Promise<void> {
		const [module] = await this.drizzleService.db
			.select({ id: modules.id })
			.from(modules)
			.where(eq(modules.id, moduleId))
			.limit(1);

		if (!module) {
			throw new NotFoundException(`Module with ID ${moduleId} not found`);
		}
	}

	private async assertUserExists(userId: number): Promise<void> {
		const [user] = await this.drizzleService.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			throw new NotFoundException(`User with ID ${userId} not found`);
		}
	}
}
