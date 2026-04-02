import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { AuthenticatedRequest } from '../../../common/guards/clerk-auth.guard';
import { plannerTasks } from '../../../database/entities/planner-tasks';
import { DrizzleService } from '../../../database/drizzle.service';

/**
 * Ensures the authenticated user owns the planner task identified by `:id`.
 * Returns 404 to avoid exposing whether a task exists for another user.
 */
@Injectable()
export class PlannerTaskOwnerGuard implements CanActivate {
	constructor(private readonly drizzleService: DrizzleService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const taskId = parseInt(request.params['id'] as string, 10);

		if (Number.isNaN(taskId)) {
			throw new BadRequestException('id must be an integer.');
		}

		const userId = request.user.id;

		const [row] = await this.drizzleService.db
			.select({ id: plannerTasks.id })
			.from(plannerTasks)
			.where(and(eq(plannerTasks.id, taskId), eq(plannerTasks.userId, userId)))
			.limit(1);

		if (!row) {
			throw new NotFoundException(`Planner task ${taskId} not found`);
		}

		return true;
	}
}
