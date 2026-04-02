"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlannerEmptyTasks } from "./planner-empty-tasks";
import { PlannerTaskItem } from "./planner-task-item";
import type { PlannerTask } from "@/lib/types/planner";

interface PlannerDayTasksPanelProps {
	formattedDateLabel: string;
	tasks: PlannerTask[];
	isCreating: boolean;
	updatingTaskId: number | null;
	togglingTaskId: number | null;
	deletingTaskId: number | null;
	onCreateTask: () => void;
	onToggleComplete: (task: PlannerTask, completed: boolean) => Promise<void>;
	onEditTask: (task: PlannerTask) => void;
	onDeleteTask: (task: PlannerTask) => void;
}

function sortDayTasks(tasks: PlannerTask[]): PlannerTask[] {
	return [...tasks].sort((left, right) => {
		if (left.isCompleted !== right.isCompleted) {
			return left.isCompleted ? 1 : -1;
		}
		return left.id - right.id;
	});
}

export function PlannerDayTasksPanel({
	formattedDateLabel,
	tasks,
	isCreating,
	updatingTaskId,
	togglingTaskId,
	deletingTaskId,
	onCreateTask,
	onToggleComplete,
	onEditTask,
	onDeleteTask,
}: PlannerDayTasksPanelProps) {
	const orderedTasks = sortDayTasks(tasks);

	return (
		<Card className="h-full">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<CardTitle>Tasks For {formattedDateLabel}</CardTitle>
						<CardDescription>
							Your calendar picks the date, and this panel is the single source of task details.
						</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="secondary">{tasks.length} tasks</Badge>
						<Button type="button" className="gap-2" onClick={onCreateTask} disabled={isCreating}>
							<Plus />
							Add Task
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				{orderedTasks.length === 0 ? (
					<PlannerEmptyTasks onCreateTask={onCreateTask} disabled={isCreating} />
				) : (
					orderedTasks.map((task) => (
						<PlannerTaskItem
							key={task.id}
							task={task}
							isMutating={
								updatingTaskId === task.id ||
								togglingTaskId === task.id ||
								deletingTaskId === task.id
							}
							onToggle={onToggleComplete}
							onEdit={onEditTask}
							onDelete={onDeleteTask}
						/>
					))
				)}
			</CardContent>
		</Card>
	);
}
