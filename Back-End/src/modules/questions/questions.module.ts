import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';

import { QuestionsController } from './questions/questions.controller';
import { QuestionsService } from './questions/questions.service';
import { QuestionOptionsService } from './question-options/question-options.service';
import { OldExamsController } from './old-exams/old-exams.controller';
import { OldExamsService } from './old-exams/old-exams.service';
import { UniversitiesController } from './universities/universities.controller';
import { UniversitiesService } from './universities/universities.service';

@Module({
  imports: [DrizzleModule],
  controllers: [
    QuestionsController,
    OldExamsController,
    UniversitiesController,
  ],
  providers: [
    QuestionsService,
    QuestionOptionsService,
    OldExamsService,
    UniversitiesService,
  ],
  exports: [
    QuestionsService,
    QuestionOptionsService,
    OldExamsService,
    UniversitiesService,
  ],
})
export class QuestionsModule {}
