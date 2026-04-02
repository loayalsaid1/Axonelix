"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

interface PlannerEmptyTasksProps {
	onCreateTask: () => void;
	disabled?: boolean;
}

export function PlannerEmptyTasks({ onCreateTask, disabled }: PlannerEmptyTasksProps) {
	return (
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
					disabled={disabled}
				>
					<Plus />
					Create First Task
				</Button>
			</EmptyContent>
		</Empty>
	);
}
