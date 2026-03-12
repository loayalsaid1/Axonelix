import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { StreaksService } from './streaks.service';
import { StreaksController } from './streaks.controller';

@Module({
	imports: [DrizzleModule],
	controllers: [StreaksController],
	providers: [StreaksService],
	exports: [StreaksService],
})
export class StreaksModule { }
