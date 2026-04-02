"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { PlannerTask } from "@/lib/types/planner";
import { cn } from "@/lib/utils";

interface PlannerTaskItemProps {
	task: PlannerTask;
	isMutating: boolean;
	onToggle: (task: PlannerTask, completed: boolean) => void;
	onEdit: (task: PlannerTask) => void;
	onDelete: (task: PlannerTask) => void;
}

export function PlannerTaskItem({
	task,
	isMutating,
	onToggle,
	onEdit,
	onDelete,
}: PlannerTaskItemProps) {
	return (
		<div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40">
			<Checkbox
				checked={task.isCompleted}
				onCheckedChange={(checked) => {
					onToggle(task, checked === true);
				}}
				disabled={isMutating}
			/>
			<div className="flex min-w-0 flex-1 flex-col gap-1">
				<div className="flex items-center gap-2">
					<p
						className={cn(
							"text-sm font-medium",
							task.isCompleted && "line-through text-muted-foreground",
						)}
					>
						{task.title}
					</p>
				</div>
				{task.notes ? (
					<p className="whitespace-pre-wrap text-sm text-muted-foreground">
						{task.notes}
					</p>
				) : null}
			</div>
			<div className="flex items-center gap-1">
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={() => onEdit(task)}
					disabled={isMutating}
					aria-label="Edit task"
				>
					<Pencil />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					onClick={() => onDelete(task)}
					disabled={isMutating}
					aria-label="Delete task"
				>
					<Trash2 className="text-destructive" />
				</Button>
			</div>
		</div>
	);
}
