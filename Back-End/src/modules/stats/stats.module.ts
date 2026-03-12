import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { StreaksModule } from '../streaks/streaks.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { StatsService } from './stats.service';
import { MyStatsController } from './my-stats.controller';

@Module({
	imports: [DrizzleModule, StreaksModule, QuizzesModule],
	controllers: [MyStatsController],
	providers: [StatsService],
	exports: [StatsService],
})
export class StatsModule { }
