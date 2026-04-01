import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { Role } from '../../common/enums';
import type { UserRecord } from '../users/interfaces/user-record.interface';
import { userModuleAccess } from '../../database/entities/user-module-access';
import { lessons } from '../../database/entities/lessons';
import { chapters } from '../../database/entities/chapters';
import { subjects } from '../../database/entities/subjects';
import { oldExams } from '../../database/entities/old-exams';
import { vwQuestionAncestry } from '../../database/entities/question-hierarchy-views';

@Injectable()
export class SubscriptionsAccessService {
	constructor(private readonly drizzleService: DrizzleService) { }

	isAdmin(user: UserRecord): boolean {
		return user.role === Role.Admin;
	}

	async getOwnedModuleIds(userId: number): Promise<number[]> {
		const rows = await this.drizzleService.db
			.select({ moduleId: userModuleAccess.moduleId })
			.from(userModuleAccess)
			.where(
				and(
					eq(userModuleAccess.userId, userId),
					isNull(userModuleAccess.revokedAt),
				),
			);

		return rows.map((r) => r.moduleId);
	}

	async resolveEffectiveModuleIds(
		user: UserRecord,
		requestedModuleIds?: number[],
	): Promise<number[] | undefined> {
		const requested = requestedModuleIds?.length ? requestedModuleIds : undefined;

		if (this.isAdmin(user)) {
			return requested;
		}

		const owned = await this.getOwnedModuleIds(user.id);

		if (requested) {
			const notOwned = requested.filter((moduleId) => !owned.includes(moduleId));
			if (notOwned.length) {
				throw new ForbiddenException(
					`You do not have access to modules: ${notOwned.join(', ')}`,
				);
			}
			return requested;
		}

		return owned;
	}

	async assertUserHasModuleAccess(user: UserRecord, moduleId: number): Promise<void> {
		if (this.isAdmin(user)) return;

		const [access] = await this.drizzleService.db
			.select({ id: userModuleAccess.id })
			.from(userModuleAccess)
			.where(
				and(
					eq(userModuleAccess.userId, user.id),
					eq(userModuleAccess.moduleId, moduleId),
					isNull(userModuleAccess.revokedAt),
				),
			)
			.limit(1);

		if (!access) {
			throw new ForbiddenException('Module is locked for your account');
		}
	}

	async assertCanViewLesson(user: UserRecord, lessonId: number): Promise<number> {
		const [lessonScope] = await this.drizzleService.db
			.select({ moduleId: subjects.moduleId })
			.from(lessons)
			.innerJoin(chapters, eq(lessons.chapterId, chapters.id))
			.innerJoin(subjects, eq(chapters.subjectId, subjects.id))
			.where(eq(lessons.id, lessonId))
			.limit(1);

		if (!lessonScope) {
			throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
		}

		await this.assertUserHasModuleAccess(user, lessonScope.moduleId);
		return lessonScope.moduleId;
	}

	async assertCanViewOldExam(user: UserRecord, oldExamId: number): Promise<number> {
		const [examScope] = await this.drizzleService.db
			.select({ moduleId: oldExams.moduleId })
			.from(oldExams)
			.where(eq(oldExams.id, oldExamId))
			.limit(1);

		if (!examScope) {
			throw new NotFoundException(`Old exam with ID ${oldExamId} not found`);
		}

		await this.assertUserHasModuleAccess(user, examScope.moduleId);
		return examScope.moduleId;
	}

	async assertCanViewQuestion(user: UserRecord, questionId: number): Promise<number> {
		const [questionScope] = await this.drizzleService.db
			.select({ moduleId: vwQuestionAncestry.moduleId })
			.from(vwQuestionAncestry)
			.where(eq(vwQuestionAncestry.questionId, questionId))
			.limit(1);

		if (!questionScope) {
			throw new NotFoundException(`Question with ID ${questionId} not found`);
		}

		if (questionScope.moduleId == null) {
			if (this.isAdmin(user)) return -1;
			throw new ForbiddenException('Question is not available for student access');
		}

		await this.assertUserHasModuleAccess(user, questionScope.moduleId);
		return questionScope.moduleId;
	}

	async getAccessibleOldExamIds(user: UserRecord): Promise<number[] | undefined> {
		if (this.isAdmin(user)) return undefined;

		const ownedModuleIds = await this.getOwnedModuleIds(user.id);
		if (!ownedModuleIds.length) return [];

		const rows = await this.drizzleService.db
			.select({ id: oldExams.id })
			.from(oldExams)
			.where(inArray(oldExams.moduleId, ownedModuleIds));

		return rows.map((r) => r.id);
	}
}
