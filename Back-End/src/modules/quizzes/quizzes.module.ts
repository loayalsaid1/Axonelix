import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { QuestionsModule } from '../questions/questions.module';
import { StreaksModule } from '../streaks/streaks.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

import { QuizzesController } from './quizzes.controller';
import { QuizSessionsController } from './quiz-sessions.controller';
import { QuizzesService } from './quizzes.service';
import { QuizSessionsService } from './quiz-sessions.service';
import { QuestionCountService } from './question-count.service';

@Module({
  imports: [
    DrizzleModule,
    // AuthModule exports AuthService which ClerkAuthGuard depends on
    AuthModule,
    // QuestionsModule exports QuestionsService used for filter-building helpers
    QuestionsModule,
    // Subscriptions module exports ownership access checks for leaf-level gating
    SubscriptionsModule,
    // StreaksModule exports StreaksService used to update user streaks on session completion/suspension
    StreaksModule,
  ],
  controllers: [QuizzesController, QuizSessionsController],
  providers: [
    QuizzesService,
    QuizSessionsService,
    QuestionCountService,
  ],
  exports: [QuizzesService, QuizSessionsService, QuestionCountService],
})
export class QuizzesModule { }
