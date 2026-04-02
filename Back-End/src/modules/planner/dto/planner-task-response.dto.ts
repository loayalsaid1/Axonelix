import { plannerTasks } from '../../../database/entities/planner-tasks';

type PlannerTaskRow = typeof plannerTasks.$inferSelect;

export class PlannerTaskResponseDto {
	id!: PlannerTaskRow['id'];
	title!: PlannerTaskRow['title'];
	notes!: PlannerTaskRow['notes'];
	dueDate!: PlannerTaskRow['dueDate'];
	isCompleted!: PlannerTaskRow['isCompleted'];
	completedAt!: PlannerTaskRow['completedAt'];
	createdAt!: PlannerTaskRow['createdAt'];
	updatedAt!: PlannerTaskRow['updatedAt'];
}
