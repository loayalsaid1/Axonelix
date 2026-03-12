export class UserDashboardStatsDto {
	/** The current study streak. */
	currentStreak!: number;

	/** The longest study streak ever achieved. */
	longestStreak!: number;

	/** Total unique questions answered/attempted. */
	totalQuestionsAnswered!: number;

	/** Average performance across all completed tests. */
	averageScore!: number | null;
}
