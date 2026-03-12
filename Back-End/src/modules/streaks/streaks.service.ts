import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { studyStreaks } from '../../database/entities/study-streaks';
import { StreakResponseDto, StreakNotStartedDto } from './dto';

// ─── outcome constants ────────────────────────────────────────────────────────

export const StreakUpdateOutcome = {
	CREATED: 'CREATED',
	INCREMENTED: 'INCREMENTED',
	RESET: 'RESET',
	ALREADY_COUNTED: 'ALREADY_COUNTED',
} as const;

export type StreakUpdateResult =
	| { outcome: typeof StreakUpdateOutcome.CREATED; currentStreak: 1 }
	| { outcome: typeof StreakUpdateOutcome.INCREMENTED; currentStreak: number; longestStreak: number }
	| { outcome: typeof StreakUpdateOutcome.RESET; currentStreak: 1 }
	| { outcome: typeof StreakUpdateOutcome.ALREADY_COUNTED };

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class StreaksService {
	constructor(private readonly drizzleService: DrizzleService) { }

	/**
	 * Called whenever a user completes or suspends a quiz session.
	 * Updates the streak record and returns a typed outcome describing what changed.
	 */
	async updateStreak(userId: number): Promise<StreakUpdateResult> {
		const today = this._dateString(0);
		const yesterday = this._dateString(-1);

		const existing = await this.drizzleService.db.query.studyStreaks.findFirst({
			where: eq(studyStreaks.userId, userId),
		});

		// ── First time studying ───────────────────────────────────────────────
		if (!existing) {
			await this.drizzleService.db.insert(studyStreaks).values({
				userId,
				currentStreak: 1,
				longestStreak: 1,
				lastStudyDate: today,
				currentStreakStartDate: today,
			});
			return { outcome: StreakUpdateOutcome.CREATED, currentStreak: 1 };
		}

		// ── Already counted today ─────────────────────────────────────────────
		if (existing.lastStudyDate === today) {
			return { outcome: StreakUpdateOutcome.ALREADY_COUNTED };
		}

		// ── Consecutive day ───────────────────────────────────────────────────
		if (existing.lastStudyDate === yesterday) {
			const newCurrent = existing.currentStreak + 1;
			const newLongest = Math.max(newCurrent, existing.longestStreak);
			await this.drizzleService.db
				.update(studyStreaks)
				.set({ currentStreak: newCurrent, longestStreak: newLongest, lastStudyDate: today })
				.where(eq(studyStreaks.userId, userId));
			return { outcome: StreakUpdateOutcome.INCREMENTED, currentStreak: newCurrent, longestStreak: newLongest };
		}

		// ── Missed at least one day — reset ───────────────────────────────────
		await this.drizzleService.db
			.update(studyStreaks)
			.set({ currentStreak: 1, lastStudyDate: today, currentStreakStartDate: today })
			.where(eq(studyStreaks.userId, userId));
		return { outcome: StreakUpdateOutcome.RESET, currentStreak: 1 };
	}

	/** Returns the streak record for the given user, or zeroed defaults if it doesn't exist yet. */
	async getStreak(userId: number): Promise<StreakResponseDto | StreakNotStartedDto> {
		const streak = await this.drizzleService.db.query.studyStreaks.findFirst({
			where: eq(studyStreaks.userId, userId),
			columns: {
				id: false,
				userId: false,
			},
		});

		if (!streak) {
			return { currentStreak: 0, longestStreak: 0, lastStudyDate: null, currentStreakStartDate: null };
		}

		return streak;
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/** Returns today's date + `offsetDays` as a 'YYYY-MM-DD' string (UTC). */
	private _dateString(offsetDays: number): string {
		const d = new Date();
		d.setUTCDate(d.getUTCDate() + offsetDays);
		return d.toISOString().slice(0, 10);
	}
}
