import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { plannerTasks, type PlannerTask } from '../../database/entities/planner-tasks';
import {
	CreatePlannerTaskDto,
	PlannerTasksQueryDto,
	UpdatePlannerTaskDto,
} from './dto';

interface NormalizedRange {
	from: string;
	to: string;
}

@Injectable()
export class PlannerService {
	constructor(private readonly drizzleService: DrizzleService) { }

	private get db() {
		return this.drizzleService.db;
	}

	async listForUser(userId: number, query: PlannerTasksQueryDto): Promise<PlannerTask[]> {
		const { from, to } = this.normalizeDateRange(query);

		return this.db
			.select()
			.from(plannerTasks)
			.where(
				and(
					eq(plannerTasks.userId, userId),
					gte(plannerTasks.dueDate, from),
					lte(plannerTasks.dueDate, to),
				),
			)
			.orderBy(
				asc(plannerTasks.dueDate),
				asc(plannerTasks.isCompleted),
				asc(plannerTasks.createdAt),
			);
	}

	async createForUser(userId: number, createPlannerTaskDto: CreatePlannerTaskDto): Promise<PlannerTask> {
		const title = createPlannerTaskDto.title.trim();
		if (!title) {
			throw new BadRequestException('title must not be empty.');
		}

		const notes = createPlannerTaskDto.notes?.trim();

		const [task] = await this.db
			.insert(plannerTasks)
			.values({
				userId,
				title,
				notes: notes ? notes : null,
				dueDate: createPlannerTaskDto.dueDate,
			})
			.returning();

		return task;
	}

	async updateForUser(
		taskId: number,
		updatePlannerTaskDto: UpdatePlannerTaskDto,
	): Promise<PlannerTask> {
		const existing = await this.findTaskById(taskId);
		const changes: Partial<PlannerTask> = {};

		if (updatePlannerTaskDto.title !== undefined) {
			const normalizedTitle = updatePlannerTaskDto.title.trim();
			if (!normalizedTitle) {
				throw new BadRequestException('title must not be empty.');
			}
			changes.title = normalizedTitle;
		}

		if (updatePlannerTaskDto.notes !== undefined) {
			const normalizedNotes = updatePlannerTaskDto.notes.trim();
			changes.notes = normalizedNotes ? normalizedNotes : null;
		}

		if (updatePlannerTaskDto.dueDate !== undefined) {
			changes.dueDate = updatePlannerTaskDto.dueDate;
		}

		if (updatePlannerTaskDto.isCompleted !== undefined) {
			changes.isCompleted = updatePlannerTaskDto.isCompleted;
			if (updatePlannerTaskDto.isCompleted) {
				changes.completedAt = existing.isCompleted
					? existing.completedAt ?? new Date().toISOString()
					: new Date().toISOString();
			} else {
				changes.completedAt = null;
			}
		}

		if (Object.keys(changes).length === 0) {
			return existing;
		}

		changes.updatedAt = new Date().toISOString();

		const [updatedTask] = await this.db
			.update(plannerTasks)
			.set(changes)
			.where(eq(plannerTasks.id, taskId))
			.returning();

		if (!updatedTask) {
			throw new NotFoundException('Planner task not found.');
		}

		return updatedTask;
	}

	async removeForUser(taskId: number): Promise<{ success: boolean }> {
		const deleted = await this.db
			.delete(plannerTasks)
			.where(eq(plannerTasks.id, taskId))
			.returning({ id: plannerTasks.id });

		if (deleted.length === 0) {
			throw new NotFoundException('Planner task not found.');
		}

		return { success: true };
	}

	private async findTaskById(taskId: number): Promise<PlannerTask> {
		const [task] = await this.db
			.select()
			.from(plannerTasks)
			.where(eq(plannerTasks.id, taskId))
			.limit(1);

		if (!task) {
			throw new NotFoundException('Planner task not found.');
		}

		return task;
	}

	private normalizeDateRange(query: PlannerTasksQueryDto): NormalizedRange {
		if (query.from && query.to) {
			return {
				from: query.from,
				to: query.to,
			};
		}

		const now = new Date();
		const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
		const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

		return {
			from: this.toIsoDate(monthStart),
			to: this.toIsoDate(monthEnd),
		};
	}

	private toIsoDate(date: Date): string {
		return date.toISOString().slice(0, 10);
	}
}
