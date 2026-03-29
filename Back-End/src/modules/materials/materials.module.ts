import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { ImagesModule } from '../images/images.module';

// Import controllers
import { ModulesController } from './modules/modules.controller';
import { SubjectsController } from './subjects/subjects.controller';
import { ChaptersController } from './chapters/chapters.controller';
import { LessonsController } from './lessons/lessons.controller';

// Import services
import { ModulesService } from './modules/modules.service';
import { SubjectsService } from './subjects/subjects.service';
import { ChaptersService } from './chapters/chapters.service';
import { LessonsService } from './lessons/lessons.service';

@Module({
  imports: [DrizzleModule, ImagesModule],
  controllers: [
    ModulesController,
    SubjectsController,
    ChaptersController,
    LessonsController,
  ],
  providers: [
    ModulesService,
    SubjectsService,
    ChaptersService,
    LessonsService,
  ],
  exports: [
    ModulesService,
    SubjectsService,
    ChaptersService,
    LessonsService,
  ],
})
export class MaterialsModule { }
