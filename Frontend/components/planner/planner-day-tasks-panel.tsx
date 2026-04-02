"use client";

import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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
					<Empty className="min-h-52 border border-dashed">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<CheckCircle2 />
							</EmptyMedia>
							<EmptyTitle>No tasks planned</EmptyTitle>
							<EmptyDescription>
								Start by adding a focused study task for this day.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button
								type="button"
								variant="outline"
								className="gap-2"
								onClick={onCreateTask}
								disabled={isCreating}
							>
								<Plus />
								Create First Task
							</Button>
						</EmptyContent>
					</Empty>
				) : (
					orderedTasks.map((task) => {
						const isTaskMutating =
							updatingTaskId === task.id || togglingTaskId === task.id || deletingTaskId === task.id;

						return (
							<div
								key={task.id}
								className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
							>
								<Checkbox
									checked={task.isCompleted}
									onCheckedChange={(checked) => {
										void onToggleComplete(task, checked === true);
									}}
									disabled={isTaskMutating}
								/>
								<div className="flex min-w-0 flex-1 flex-col gap-1">
									<div className="flex items-center gap-2">
										<p className={`text-sm font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
											{task.title}
										</p>
										{/* {task.isCompleted && (
											<Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
												Completed
											</Badge>
										)} */}
									</div>
									{task.notes ? (
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.notes}</p>
									) : null}
								</div>
								<div className="flex items-center gap-1">
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={() => onEditTask(task)}
										disabled={isTaskMutating}
										aria-label="Edit task"
									>
										<Pencil />
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										onClick={() => onDeleteTask(task)}
										disabled={isTaskMutating}
										aria-label="Delete task"
									>
										<Trash2 className="text-destructive" />
									</Button>
								</div>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
