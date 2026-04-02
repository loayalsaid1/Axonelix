import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../database/drizzle.module';
import { PlannerController } from './planner.controller';
import { PlannerTaskOwnerGuard } from './guards/planner-task-owner.guard';
import { PlannerService } from './planner.service';

@Module({
	imports: [DrizzleModule],
	controllers: [PlannerController],
	providers: [PlannerService, PlannerTaskOwnerGuard],
	exports: [PlannerService],
})
export class PlannerModule { }
