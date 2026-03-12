import { studyStreaks } from '../../../database/entities/study-streaks';

type StreakRow = typeof studyStreaks.$inferSelect;

/**
 * Streak record returned to the authenticated user.
 * Omits `id` and `userId` — the record is always scoped to the requester.
 */
export class StreakResponseDto {
	currentStreak!: StreakRow['currentStreak'];
	longestStreak!: StreakRow['longestStreak'];
	lastStudyDate!: StreakRow['lastStudyDate'];
	currentStreakStartDate!: StreakRow['currentStreakStartDate'];
	updatedAt!: StreakRow['updatedAt'];
}

/**
 * Returned when the user has never studied before.
 * All numeric fields are 0, date fields are null.
 */
export class StreakNotStartedDto {
	currentStreak!: 0;
	longestStreak!: 0;
	lastStudyDate!: null;
	currentStreakStartDate!: null;
}
