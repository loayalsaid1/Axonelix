import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PlannerTask } from "@/lib/types/planner";

interface PlannerDeleteTaskDialogProps {
	deleteCandidate: PlannerTask | null;
	deletingTaskId: number | null;
	onConfirmDelete: () => Promise<void>;
	onOpenChange: (open: boolean) => void;
}

export function PlannerDeleteTaskDialog({
	deleteCandidate,
	deletingTaskId,
	onConfirmDelete,
	onOpenChange,
}: PlannerDeleteTaskDialogProps) {
	const isDeletingCurrentCandidate = deletingTaskId === deleteCandidate?.id;

	return (
		<AlertDialog open={!!deleteCandidate} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete task?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone and will permanently remove this task from your planner.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeletingCurrentCandidate}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						onClick={() => {
							void onConfirmDelete();
						}}
						disabled={isDeletingCurrentCandidate}
					>
						{isDeletingCurrentCandidate ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
