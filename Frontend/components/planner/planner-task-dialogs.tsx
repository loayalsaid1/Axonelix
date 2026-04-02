import { PlannerTaskFormDialog, type PlannerTaskFormValues } from "@/components/planner/planner-task-form-dialog";
import type { PlannerTask } from "@/lib/types/planner";

interface PlannerTaskDialogsProps {
	createOpen: boolean;
	creating: boolean;
	editingTask: PlannerTask | null;
	selectedDateLabel: string;
	updatingTaskId: number | null;
	onCreateOpenChange: (open: boolean) => void;
	onEditOpenChange: (open: boolean) => void;
	onCreateSubmit: (values: PlannerTaskFormValues) => Promise<void>;
	onEditSubmit: (values: PlannerTaskFormValues) => Promise<void>;
}

export function PlannerTaskDialogs({
	createOpen,
	creating,
	editingTask,
	selectedDateLabel,
	updatingTaskId,
	onCreateOpenChange,
	onEditOpenChange,
	onCreateSubmit,
	onEditSubmit,
}: PlannerTaskDialogsProps) {
	return (
		<>
			<PlannerTaskFormDialog
				open={createOpen}
				onOpenChange={onCreateOpenChange}
				title="Add Study Task"
				description={`Create a new task for ${selectedDateLabel}.`}
				submitLabel="Create Task"
				isSubmitting={creating}
				onSubmit={onCreateSubmit}
			/>

			<PlannerTaskFormDialog
				open={!!editingTask}
				onOpenChange={onEditOpenChange}
				title="Edit Study Task"
				description="Update this task details."
				submitLabel="Save Changes"
				isSubmitting={updatingTaskId === editingTask?.id}
				initialValues={
					editingTask
						? {
							title: editingTask.title,
							notes: editingTask.notes ?? "",
						}
						: undefined
				}
				onSubmit={onEditSubmit}
			/>
		</>
	);
}
