import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { ImagesModule } from '../images/images.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

import { QuestionsController } from './questions/questions.controller';
import { QuestionsService } from './questions/questions.service';
import { QuestionOptionsService } from './question-options/question-options.service';
import { OldExamsController } from './old-exams/old-exams.controller';
import { OldExamsService } from './old-exams/old-exams.service';
import { UniversitiesController } from './universities/universities.controller';
import { UniversitiesService } from './universities/universities.service';
import { ReferencesService } from './references/references.service';
import { ReferencesController } from './references/references.controller';

@Module({
  imports: [DrizzleModule, ImagesModule, SubscriptionsModule],
  controllers: [
    // Specific-prefix controllers MUST come before QuestionsController so that
    // routes like GET /questions/old-exams are not swallowed by GET /questions/:id
    OldExamsController,
    UniversitiesController,
    ReferencesController,
    QuestionsController,
  ],
  providers: [
    QuestionsService,
    QuestionOptionsService,
    OldExamsService,
    UniversitiesService,
    ReferencesService,

  ],
  exports: [
    QuestionsService,
    QuestionOptionsService,
    OldExamsService,
    UniversitiesService,
  ],
})
export class QuestionsModule { }
