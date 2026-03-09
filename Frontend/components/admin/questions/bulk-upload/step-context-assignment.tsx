'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MaterialSelector } from '@/components/admin/shared/material-selector';
import { OldExamForm } from '@/components/admin/shared/old-exam-form';
import { useMaterialHierarchy } from '@/hooks/admin/use-material-hierarchy';
import { useModules } from '@/hooks/admin/use-modules';
import { useUniversities } from '@/hooks/admin/use-universities';
import { useOldExams } from '@/hooks/admin/use-old-exams';
import { useOldExamManager } from '@/hooks/admin/use-old-exam-manager';

export interface ContextAssignment {
	lessonId: number | null;
	chapterId: number | null;
	isMisc: boolean;
	oldExamId: number | null;
}

interface StepContextAssignmentProps {
	validCount: number;
	onBack: () => void;
	onSubmit: (context: ContextAssignment) => void;
	isSubmitting: boolean;
}

export function StepContextAssignment({
	validCount,
	onBack,
	onSubmit,
	isSubmitting,
}: StepContextAssignmentProps) {
	const { modules } = useModules();
	const { universities, createUniversity } = useUniversities();
	const { exams, refetch: refetchExams } = useOldExams();
	const { findOrCreateOldExam } = useOldExamManager(exams);

	const {
		selectedModule,
		setSelectedModule,
		selectedSubject,
		setSelectedSubject,
		selectedChapter,
		setSelectedChapter,
		subjects,
		chapters,
		lessons,
	} = useMaterialHierarchy();

	const [lessonId, setLessonId] = useState('');
	const [chapterId, setChapterId] = useState('');
	const [isMisc, setIsMisc] = useState(false);

	const [isOldExamBatch, setIsOldExamBatch] = useState(false);
	const [oldExamData, setOldExamData] = useState({
		universityId: '',
		moduleId: '',
		moduleType: 'theoretical' as 'theoretical' | 'practical',
		examType: 'final' as 'final' | 'midterm' | 'tpl' | 'flipped',
		year: new Date().getFullYear(),
	});

	const [error, setError] = useState<string | null>(null);

	const getMaterialLabel = (): string => {
		if (isMisc && chapterId) {
			const chapter = chapters.find((c) => c.id === chapterId);
			return `Chapter (Misc) · ${chapter?.name ?? chapterId}`;
		}
		if (lessonId) {
			const lesson = lessons.find((l) => l.id === lessonId);
			const chapter = chapters.find((c) => c.id === chapterId);
			return `${chapter?.name ?? ''} → ${lesson?.name ?? lessonId}`;
		}
		if (chapterId) {
			const chapter = chapters.find((c) => c.id === chapterId);
			return `Chapter · ${chapter?.name ?? chapterId}`;
		}
		return '';
	};

	const getOldExamLabel = (): string => {
		if (!isOldExamBatch) return '';
		const mod = modules.find((m) => m.id === oldExamData.moduleId);
		if (!mod) return '(old exam — no module selected)';
		return `Old Exam · ${mod.name} (${oldExamData.moduleType}) · ${oldExamData.examType} ${oldExamData.year}`;
	};

	const getContextLabel = (): string => {
		const materialLabel = getMaterialLabel();
		const oldExamLabel = getOldExamLabel();
		if (materialLabel && oldExamLabel) return `${materialLabel}  +  ${oldExamLabel}`;
		return materialLabel || oldExamLabel;
	};

	const handleCreateUniversity = async (name: string) => {
		const created = await createUniversity(name);
		if (created) setOldExamData((prev) => ({ ...prev, universityId: created.id }));
	};

	const handleUpload = async () => {
		setError(null);

		// Resolve old exam first (if toggled)
		let resolvedOldExamId: number | null = null;
		if (isOldExamBatch) {
			if (!oldExamData.universityId || !oldExamData.moduleId) {
				setError('Please select university and module for the old exam.');
				return;
			}
			const examId = await findOrCreateOldExam(oldExamData);
			if (!examId) {
				setError('Failed to resolve old exam. Please try again.');
				return;
			}
			resolvedOldExamId = Number(examId);
			refetchExams();
		}

		// Need at least one context: a chapter OR an old exam
		if (!chapterId && !resolvedOldExamId) {
			setError('Please select a chapter, or attach this batch to an old exam.');
			return;
		}

		// Both contexts can coexist — matches CreateQuestionDialog behaviour
		onSubmit({
			lessonId: lessonId ? Number(lessonId) : null,
			chapterId: chapterId ? Number(chapterId) : null,
			isMisc,
			oldExamId: resolvedOldExamId,
		});
	};

	const contextLabel = getContextLabel();

	return (
		<div className="space-y-6">
			{/* Batch summary */}
			<div className="rounded-lg border bg-muted/30 px-4 py-3">
				<p className="text-sm">
					You are about to upload{' '}
					<strong>{validCount} question{validCount !== 1 ? 's' : ''}</strong>.{' '}
					{contextLabel ? (
						<>
							They will all be assigned to{' '}
							<strong className="text-foreground">{contextLabel}</strong>.
						</>
					) : (
						<span className="text-muted-foreground">Assign a context below.</span>
					)}
				</p>
			</div>

			{/* Material Selector */}
			<MaterialSelector
				modules={modules}
				subjects={subjects}
				chapters={chapters}
				lessons={lessons}
				selectedModule={selectedModule}
				selectedSubject={selectedSubject}
				selectedChapter={selectedChapter}
				lessonId={lessonId}
				isMisc={isMisc}
				onModuleChange={(id) => {
					setSelectedModule(id);
					setChapterId('');
					setLessonId('');
				}}
				onSubjectChange={(id) => {
					setSelectedSubject(id);
					setChapterId('');
					setLessonId('');
				}}
				onChapterChange={(id) => {
					setSelectedChapter(id);
					setChapterId(id);
					setLessonId('');
				}}
				onLessonChange={(id) => setLessonId(id)}
				onIsMiscChange={(val) => setIsMisc(val)}
			/>

			{/* Old Exam Toggle */}
			<div className="space-y-4 border-t pt-4">
				<div className="flex items-center gap-2">
					<Checkbox
						id="old-exam-batch-toggle"
						checked={isOldExamBatch}
						onCheckedChange={(v) => setIsOldExamBatch(!!v)}
					/>
					<Label htmlFor="old-exam-batch-toggle" className="cursor-pointer text-sm font-medium">
						This batch belongs to an old exam
					</Label>
				</div>

				{isOldExamBatch && (
					<div className="pt-2">
						<OldExamForm
							data={oldExamData}
							onChange={setOldExamData}
							modules={modules}
							universities={universities}
							onCreateUniversity={handleCreateUniversity}
						/>
					</div>
				)}
			</div>

			{/* Error message */}
			{error && (
				<div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
					<AlertCircle className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{/* Navigation */}
			<div className="flex justify-between border-t pt-4">
				<Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
					Back
				</Button>
				<Button
					type="button"
					onClick={handleUpload}
					disabled={isSubmitting || validCount === 0}
				>
					{isSubmitting ? 'Uploading…' : `Upload ${validCount} Question${validCount !== 1 ? 's' : ''}`}
				</Button>
			</div>
		</div>
	);
}
