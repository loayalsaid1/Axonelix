export interface PlannerTask {
	id: number;
	title: string;
	notes: string | null;
	dueDate: string;
	isCompleted: boolean;
	completedAt: string | null;
	createdAt: string | null;
	updatedAt: string | null;
}

export interface PlannerTasksQuery {
	from: string;
	to: string;
}

export interface CreatePlannerTaskPayload {
	title: string;
	notes?: string;
	dueDate: string;
}

export interface UpdatePlannerTaskPayload {
	title?: string;
	notes?: string;
	dueDate?: string;
	isCompleted?: boolean;
}
