"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface PlannerTaskFormValues {
	title: string;
	notes?: string;
}

interface PlannerTaskFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	submitLabel: string;
	isSubmitting?: boolean;
	initialValues?: PlannerTaskFormValues;
	onSubmit: (values: PlannerTaskFormValues) => Promise<void>;
}

export function PlannerTaskFormDialog({
	open,
	onOpenChange,
	title,
	description,
	submitLabel,
	isSubmitting = false,
	initialValues,
	onSubmit,
}: PlannerTaskFormDialogProps) {
	const [taskTitle, setTaskTitle] = useState(initialValues?.title ?? "");
	const [taskNotes, setTaskNotes] = useState(initialValues?.notes ?? "");
	const [titleError, setTitleError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		setTaskTitle(initialValues?.title ?? "");
		setTaskNotes(initialValues?.notes ?? "");
		setTitleError(null);
	}, [initialValues, open]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const normalizedTitle = taskTitle.trim();
		const normalizedNotes = taskNotes.trim();

		if (!normalizedTitle) {
			setTitleError("Task title is required.");
			return;
		}

		setTitleError(null);
		await onSubmit({
			title: normalizedTitle,
			notes: normalizedNotes || undefined,
		});
		onOpenChange(false);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<div className="grid gap-2">
						<Label htmlFor="planner-task-title">Task Title</Label>
						<Input
							id="planner-task-title"
							value={taskTitle}
							onChange={(event) => {
								setTaskTitle(event.target.value);
								if (titleError) {
									setTitleError(null);
								}
							}}
							placeholder="e.g. Revise cardiac physiology"
							disabled={isSubmitting}
						/>
						{titleError ? <p className="text-sm text-destructive">{titleError}</p> : null}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="planner-task-notes">Notes</Label>
						<Textarea
							id="planner-task-notes"
							value={taskNotes}
							onChange={(event) => setTaskNotes(event.target.value)}
							placeholder="Optional details, reminders, or resource links"
							rows={4}
							disabled={isSubmitting}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
