"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PlannerDayPicker } from "@/components/planner/planner-day-picker";
import { PlannerDeleteTaskDialog } from "@/components/planner/planner-delete-task-dialog";
import { PlannerHeaderCard } from "@/components/planner/planner-header-card";
import { PlannerTaskDialogs } from "@/components/planner/planner-task-dialogs";
import { PlannerDayTasksPanel } from "@/components/planner/planner-day-tasks-panel";
import { PlannerTipCard } from "@/components/planner/planner-tip-card";
import { usePlannerWorkspace } from "@/components/planner/use-planner-workspace";

export function PlannerWorkspace() {
	const {
		createOpen,
		creating,
		deleteCandidate,
		deletingTaskId,
		editingTask,
		handleCreateTask,
		handleDeleteTask,
		handleEditTask,
		handleMonthChange,
		handleSelectDate,
		handleToggleComplete,
		loadingDay,
		monthAnchor,
		selectedDate,
		selectedDateLabel,
		setCreateOpen,
		setDeleteCandidate,
		setEditingTask,
		tasks,
		togglingTaskId,
		updatingTaskId,
	} = usePlannerWorkspace();

	return (
		<>
			<div className="flex flex-col gap-6 p-6 pt-2">
				<PlannerHeaderCard />

				<div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
					<PlannerDayPicker
						monthAnchor={monthAnchor}
						selectedDate={selectedDate}
						onSelectDate={handleSelectDate}
						onMonthChange={handleMonthChange}
						disabled={loadingDay}
					/>

					{loadingDay ? (
						<Skeleton className="h-112.5 w-full rounded-xl" />
					) : (
						<PlannerDayTasksPanel
							formattedDateLabel={selectedDateLabel}
							tasks={tasks}
							isCreating={creating}
							updatingTaskId={updatingTaskId}
							togglingTaskId={togglingTaskId}
							deletingTaskId={deletingTaskId}
							onCreateTask={() => setCreateOpen(true)}
							onToggleComplete={handleToggleComplete}
							onEditTask={(task) => setEditingTask(task)}
							onDeleteTask={(task) => setDeleteCandidate(task)}
						/>
					)}
				</div>

				<PlannerTipCard />
			</div>

			<PlannerTaskDialogs
				createOpen={createOpen}
				creating={creating}
				editingTask={editingTask}
				selectedDateLabel={selectedDateLabel}
				updatingTaskId={updatingTaskId}
				onCreateOpenChange={setCreateOpen}
				onEditOpenChange={(open) => {
					if (!open) {
						setEditingTask(null);
					}
				}}
				onCreateSubmit={handleCreateTask}
				onEditSubmit={handleEditTask}
			/>

			<PlannerDeleteTaskDialog
				deleteCandidate={deleteCandidate}
				deletingTaskId={deletingTaskId}
				onConfirmDelete={handleDeleteTask}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteCandidate(null);
					}
				}}
			/>
		</>
	);
}
