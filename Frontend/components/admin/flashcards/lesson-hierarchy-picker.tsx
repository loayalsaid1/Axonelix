"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw } from "lucide-react";
import {
	type ChapterOption,
	type LessonOption,
	type ModuleOption,
	type SubjectOption,
} from "@/lib/types/lesson-hierarchy.types";

export type { ModuleOption, SubjectOption, ChapterOption, LessonOption };

interface LessonHierarchyPickerProps {
	modules: ModuleOption[];
	subjects: SubjectOption[];
	chapters: ChapterOption[];
	lessons: LessonOption[];
	selectedModuleId: number | null;
	selectedSubjectId: number | null;
	selectedChapterId: number | null;
	selectedLessonId: number | null;
	loading: boolean;
	disabled?: boolean;
	onModuleChange: (moduleId: number | null) => void;
	onSubjectChange: (subjectId: number | null) => void;
	onChapterChange: (chapterId: number | null) => void;
	onLessonChange: (lessonId: number | null) => void;
	onReset: () => void;
}

export function LessonHierarchyPicker({
	modules,
	subjects,
	chapters,
	lessons,
	selectedModuleId,
	selectedSubjectId,
	selectedChapterId,
	selectedLessonId,
	loading,
	disabled = false,
	onModuleChange,
	onSubjectChange,
	onChapterChange,
	onLessonChange,
	onReset,
}: LessonHierarchyPickerProps) {
	const selectedModule = modules.find((item) => item.id === selectedModuleId);
	const selectedSubject = subjects.find((item) => item.id === selectedSubjectId);
	const selectedChapter = chapters.find((item) => item.id === selectedChapterId);
	const selectedLesson = lessons.find((item) => item.id === selectedLessonId);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Lesson Finder</CardTitle>
				<CardDescription>
					Select a lesson to manage its official Axonelix flashcards deck.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<Label>Module</Label>
					<Select
						value={selectedModuleId ? String(selectedModuleId) : undefined}
						onValueChange={(value) => onModuleChange(Number(value))}
						disabled={loading || disabled}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose module" />
						</SelectTrigger>
						<SelectContent>
							{modules.map((moduleItem) => (
								<SelectItem key={moduleItem.id} value={String(moduleItem.id)}>
									{moduleItem.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-2">
					<Label>Subject</Label>
					<Select
						value={selectedSubjectId ? String(selectedSubjectId) : undefined}
						onValueChange={(value) => onSubjectChange(Number(value))}
						disabled={loading || disabled || !selectedModuleId}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose subject" />
						</SelectTrigger>
						<SelectContent>
							{subjects.map((subjectItem) => (
								<SelectItem key={subjectItem.id} value={String(subjectItem.id)}>
									{subjectItem.name} ({subjectItem.type})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-2">
					<Label>Chapter</Label>
					<Select
						value={selectedChapterId ? String(selectedChapterId) : undefined}
						onValueChange={(value) => onChapterChange(Number(value))}
						disabled={loading || disabled || !selectedSubjectId}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose chapter" />
						</SelectTrigger>
						<SelectContent>
							{chapters.map((chapterItem) => (
								<SelectItem key={chapterItem.id} value={String(chapterItem.id)}>
									{chapterItem.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-2">
					<Label>Lesson</Label>
					<Select
						value={selectedLessonId ? String(selectedLessonId) : undefined}
						onValueChange={(value) => onLessonChange(Number(value))}
						disabled={loading || disabled || !selectedChapterId}
					>
						<SelectTrigger>
							<SelectValue placeholder="Choose lesson" />
						</SelectTrigger>
						<SelectContent>
							{lessons.map((lessonItem) => (
								<SelectItem key={lessonItem.id} value={String(lessonItem.id)}>
									{lessonItem.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="rounded-lg border bg-muted/30 p-3">
					<p className="text-xs font-medium text-muted-foreground">Current Path</p>
					<div className="mt-2 flex flex-wrap items-center gap-2">
						{selectedModule ? <Badge variant="secondary">{selectedModule.name}</Badge> : null}
						{selectedSubject ? <Badge variant="secondary">{selectedSubject.name}</Badge> : null}
						{selectedChapter ? <Badge variant="secondary">{selectedChapter.name}</Badge> : null}
						{selectedLesson ? <Badge>{selectedLesson.name}</Badge> : null}
						{!selectedLesson ? <span className="text-sm text-muted-foreground">No lesson selected</span> : null}
					</div>
				</div>

				<div className="flex items-center justify-between">
					{loading ? (
						<div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
							<Loader2 className="size-4 animate-spin" />
							Loading hierarchy...
						</div>
					) : disabled ? (
						<span className="text-sm text-muted-foreground">Wait for current flashcard operation to finish.</span>
					) : (
						<span className="text-sm text-muted-foreground">Use the picker to switch lesson context.</span>
					)}

					<Button type="button" variant="ghost" onClick={onReset} className="gap-2" disabled={disabled}>
						<RotateCcw className="size-4" />
						Reset
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
