"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApiFetch } from "@/hooks/use-api-fetch";
import {
	createPlannerTask,
	deletePlannerTask,
	getPlannerTasks,
	updatePlannerTask,
} from "@/lib/api/planner";
import type { PlannerTask } from "@/lib/types/planner";
import { formatLongDate, parseIsoDate, startOfMonth, toIsoDate } from "@/components/planner/date-utils";

export interface PlannerTaskDraft {
	title: string;
	notes?: string;
}

function todayIsoDate(): string {
	return toIsoDate(new Date());
}

export function usePlannerWorkspace() {
	const authFetch = useApiFetch();

	const [monthAnchor, setMonthAnchor] = useState<Date>(() => startOfMonth(new Date()));
	const [selectedDate, setSelectedDate] = useState<string>(() => todayIsoDate());

	const [tasks, setTasks] = useState<PlannerTask[]>([]);
	const [loadingDay, setLoadingDay] = useState(false);
	const [creating, setCreating] = useState(false);
	const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
	const [togglingTaskId, setTogglingTaskId] = useState<number | null>(null);
	const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

	const [createOpen, setCreateOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<PlannerTask | null>(null);

	const loadSelectedDayTasks = useCallback(async () => {
		setLoadingDay(true);
		try {
			const dayTasks = await getPlannerTasks(authFetch, {
				from: selectedDate,
				to: selectedDate,
			});
			setTasks(dayTasks ?? []);
		} catch (error) {
			console.error("Failed to load planner tasks:", error);
			toast.error(error instanceof Error ? error.message : "Failed to load planner tasks.");
		} finally {
			setLoadingDay(false);
		}
	}, [authFetch, selectedDate]);

	useEffect(() => {
		void loadSelectedDayTasks();
	}, [loadSelectedDayTasks]);

	useEffect(() => {
		const selected = parseIsoDate(selectedDate);
		if (
			selected.getUTCFullYear() === monthAnchor.getUTCFullYear() &&
			selected.getUTCMonth() === monthAnchor.getUTCMonth()
		) {
			return;
		}

		setSelectedDate(toIsoDate(monthAnchor));
	}, [monthAnchor, selectedDate]);

	const selectedDateLabel = useMemo(() => formatLongDate(parseIsoDate(selectedDate)), [selectedDate]);

	const handleCreateTask = useCallback(
		async (values: PlannerTaskDraft) => {
			try {
				setCreating(true);
				const createdTask = await createPlannerTask(authFetch, {
					title: values.title,
					notes: values.notes,
					dueDate: selectedDate,
				});

				if (createdTask.dueDate === selectedDate) {
					setTasks((currentTasks) => [...currentTasks, createdTask]);
				}

				toast.success("Task created.");
			} catch (error) {
				console.error("Failed to create planner task:", error);
				toast.error(error instanceof Error ? error.message : "Failed to create task.");
				throw error;
			} finally {
				setCreating(false);
			}
		},
		[authFetch, selectedDate],
	);

	const handleEditTask = useCallback(
		async (values: PlannerTaskDraft) => {
			if (!editingTask) {
				return;
			}

			try {
				setUpdatingTaskId(editingTask.id);
				const updatedTask = await updatePlannerTask(authFetch, editingTask.id, {
					title: values.title,
					notes: values.notes,
				});

				setTasks((currentTasks) => {
					const withoutTask = currentTasks.filter((task) => task.id !== updatedTask.id);
					if (updatedTask.dueDate !== selectedDate) {
						return withoutTask;
					}

					return [...withoutTask, updatedTask];
				});

				toast.success("Task updated.");
			} catch (error) {
				console.error("Failed to update planner task:", error);
				toast.error(error instanceof Error ? error.message : "Failed to update task.");
				throw error;
			} finally {
				setUpdatingTaskId(null);
			}
		},
		[authFetch, editingTask, selectedDate],
	);

	const handleToggleComplete = useCallback(
		async (task: PlannerTask, completed: boolean) => {
			try {
				setTogglingTaskId(task.id);
				const updatedTask = await updatePlannerTask(authFetch, task.id, {
					isCompleted: completed,
				});

				setTasks((currentTasks) =>
					currentTasks.map((currentTask) =>
						currentTask.id === updatedTask.id ? updatedTask : currentTask,
					),
				);
			} catch (error) {
				console.error("Failed to toggle planner task:", error);
				toast.error(error instanceof Error ? error.message : "Failed to update task state.");
			} finally {
				setTogglingTaskId(null);
			}
		},
		[authFetch],
	);

	const handleDeleteTask = useCallback(async () => {
		if (!deleteCandidate) {
			return;
		}

		try {
			setDeletingTaskId(deleteCandidate.id);
			await deletePlannerTask(authFetch, deleteCandidate.id);

			setTasks((currentTasks) =>
				currentTasks.filter((task) => task.id !== deleteCandidate.id),
			);

			toast.success("Task deleted.");
		} catch (error) {
			console.error("Failed to delete planner task:", error);
			toast.error(error instanceof Error ? error.message : "Failed to delete task.");
		} finally {
			setDeletingTaskId(null);
			setDeleteCandidate(null);
		}
	}, [authFetch, deleteCandidate]);

	const handleMonthChange = useCallback((nextMonth: Date) => {
		setMonthAnchor(startOfMonth(nextMonth));
	}, []);

	const handleSelectDate = useCallback((isoDate: string) => {
		setSelectedDate(isoDate);
	}, []);

	return {
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
	};
}
