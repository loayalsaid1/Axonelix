import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { AuthModule } from '../auth/auth.module';
import { QuestionsModule } from '../questions/questions.module';

import { QuizzesController } from './quizzes.controller';
import { QuizSessionsController } from './quiz-sessions.controller';
import { QuizzesService } from './quizzes.service';
import { QuizSessionsService } from './quiz-sessions.service';

@Module({
  imports: [
    DrizzleModule,
    // AuthModule exports AuthService which ClerkAuthGuard depends on
    AuthModule,
    // QuestionsModule exports QuestionsService used for filter-building helpers
    QuestionsModule,
  ],
  controllers: [QuizzesController, QuizSessionsController],
  providers: [
    QuizzesService,
    QuizSessionsService,
  ],
  exports: [QuizzesService, QuizSessionsService],
})
export class QuizzesModule {}
