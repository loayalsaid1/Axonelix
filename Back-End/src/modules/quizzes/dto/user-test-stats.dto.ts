/**
 * Aggregated statistics about a user's quiz-session history.
 * Returned by GET /quiz-sessions/stats.
 */
export class UserTestStatsDto {
  /** Total number of quiz sessions ever created by this user. */
  totalSessions!: number;

  /** Sessions the user has fully submitted. */
  completedCount!: number;

  /** Sessions the user started but explicitly suspended (paused). */
  suspendedCount!: number;

  /** Sessions currently in flight (tab open, timer running). */
  inProgressCount!: number;

  /** Sessions generated but never started yet. */
  notStartedCount!: number;

  /**
   * Average score percentage across ALL completed sessions.
   * null when the user has no completed sessions yet.
   * Written-question-only sessions where isCorrect is always null will
   * contribute a null average and are excluded from the avg by Postgres FILTER.
   */
  averageScore!: number | null;
}
