import type { FetchOptions } from '@/lib/api/client';
import type {
	CreatePlannerTaskPayload,
	PlannerTask,
	PlannerTasksQuery,
	UpdatePlannerTaskPayload,
} from '@/lib/types/planner';

export type AuthApiFetch = <T>(path: string, options?: FetchOptions) => Promise<T>;

export function getPlannerTasks(authFetch: AuthApiFetch, query: PlannerTasksQuery): Promise<PlannerTask[]> {
	const params = new URLSearchParams({
		from: query.from,
		to: query.to,
	});
	return authFetch<PlannerTask[]>(`/planner/tasks?${params.toString()}`);
}

export function createPlannerTask(
	authFetch: AuthApiFetch,
	payload: CreatePlannerTaskPayload,
): Promise<PlannerTask> {
	return authFetch<PlannerTask>('/planner/tasks', {
		method: 'POST',
		body: payload,
	});
}

export function updatePlannerTask(
	authFetch: AuthApiFetch,
	taskId: number,
	payload: UpdatePlannerTaskPayload,
): Promise<PlannerTask> {
	return authFetch<PlannerTask>(`/planner/tasks/${taskId}`, {
		method: 'PATCH',
		body: payload,
	});
}

export function deletePlannerTask(authFetch: AuthApiFetch, taskId: number): Promise<{ success: boolean }> {
	return authFetch<{ success: boolean }>(`/planner/tasks/${taskId}`, {
		method: 'DELETE',
	});
}
