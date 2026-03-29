import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImagesCronService } from './images.cron.service';
import { DrizzleModule } from '../../database/drizzle.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		DrizzleModule,
		// Add explicitly if ScheduleModule is not globally imported
		// ScheduleModule.forRoot()
	],
	controllers: [ImagesController],
	providers: [ImagesService, ImagesCronService],
	exports: [ImagesService], // Exported for use in Lessons/Questions modules
})
export class ImagesModule { }
