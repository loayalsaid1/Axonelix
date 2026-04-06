"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface FlashcardFormValues {
	front: string;
	back: string;
}

interface FlashcardFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	submitLabel: string;
	initialValues?: Partial<FlashcardFormValues>;
	onSubmit: (values: FlashcardFormValues) => Promise<void>;
}

export function FlashcardFormDialog({
	open,
	onOpenChange,
	title,
	description,
	submitLabel,
	initialValues,
	onSubmit,
}: FlashcardFormDialogProps) {
	const [submitting, setSubmitting] = useState(false);
	const [front, setFront] = useState(initialValues?.front ?? "");
	const [back, setBack] = useState(initialValues?.back ?? "");
	const [frontError, setFrontError] = useState<string | null>(null);
	const [backError, setBackError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		setFront(initialValues?.front ?? "");
		setBack(initialValues?.back ?? "");
		setFrontError(null);
		setBackError(null);
	}, [initialValues, open]);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const normalizedFront = front.trim();
		const normalizedBack = back.trim();

		setFrontError(normalizedFront ? null : "Front side is required.");
		setBackError(normalizedBack ? null : "Back side is required.");

		if (!normalizedFront || !normalizedBack) {
			return;
		}

		try {
			setSubmitting(true);
			await onSubmit({
				front: normalizedFront,
				back: normalizedBack,
			});
			onOpenChange(false);
		} finally {
			setSubmitting(false);
		}
	}

	function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
			event.preventDefault();
			event.currentTarget.form?.requestSubmit();
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description ? <DialogDescription>{description}</DialogDescription> : null}
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div className="grid gap-2">
						<Label htmlFor="flashcard-front">Front Side</Label>
						<Textarea
							id="flashcard-front"
							value={front}
							onChange={(event) => {
								setFront(event.target.value);
								if (frontError) {
									setFrontError(null);
								}
							}}
							rows={4}
							placeholder="Add the prompt, question, or concept on the front side"
							disabled={submitting}
							onKeyDown={handleTextareaKeyDown}
						/>
						{frontError ? <p className="text-sm text-destructive">{frontError}</p> : null}
					</div>

					<div className="grid gap-2">
						<Label htmlFor="flashcard-back">Back Side</Label>
						<Textarea
							id="flashcard-back"
							value={back}
							onChange={(event) => {
								setBack(event.target.value);
								if (backError) {
									setBackError(null);
								}
							}}
							rows={5}
							placeholder="Add the answer or explanation on the back side"
							disabled={submitting}
							onKeyDown={handleTextareaKeyDown}
						/>
						{backError ? <p className="text-sm text-destructive">{backError}</p> : null}
					</div>

					<p className="text-xs text-muted-foreground">Tip: press Ctrl/Cmd + Enter to save.</p>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={submitting}
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Saving..." : submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
