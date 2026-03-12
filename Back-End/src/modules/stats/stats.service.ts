import { Injectable } from '@nestjs/common';
import { count } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { StreaksService } from '../streaks/streaks.service';
import { QuizSessionsService } from '../quizzes/quiz-sessions.service';
import { UserDashboardStatsDto } from './dto/stats-response.dto';
import { users } from '../../database/entities/users';
import { questions } from '../../database/entities/questions';
import { userQuestionStatus } from '../../database/entities/user-question-status';

@Injectable()
export class StatsService {
	constructor(
		private readonly drizzleService: DrizzleService,
		private readonly streaksService: StreaksService,
		private readonly quizSessionsService: QuizSessionsService,
	) { }

	/**
	 * Aggregates stats for the student dashboard.
	 * Cross-module call to Streaks and Quizzes.
	 */
	async getStudentOverview(userId: number): Promise<UserDashboardStatsDto> {
		const [streak, averageScore, answeredCount] = await Promise.all([
			this.streaksService.getStreak(userId),
			this.quizSessionsService.getAverageScore(userId),
			this.quizSessionsService.getUniqueAnsweredCount(userId),
		]);

		return {
			currentStreak: streak.currentStreak,
			longestStreak: streak.longestStreak,
			totalQuestionsAnswered: answeredCount,
			averageScore,
		};
	}
}
