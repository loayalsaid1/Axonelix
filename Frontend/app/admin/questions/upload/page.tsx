'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCsvParser } from '@/hooks/admin/use-csv-parser';
import { bulkCreateQuestions } from '@/lib/api/questions';
import type { BulkCreateQuestionInput } from '@/lib/api/questions';
import { UploadProgressSteps } from '@/components/admin/questions/bulk-upload/upload-progress-steps';
import { StepUploadFile } from '@/components/admin/questions/bulk-upload/step-upload-file';
import { StepPreviewTable } from '@/components/admin/questions/bulk-upload/step-preview-table';
import {
	StepContextAssignment,
	type ContextAssignment,
} from '@/components/admin/questions/bulk-upload/step-context-assignment';

export default function BulkUploadPage() {
	const router = useRouter();
	const { toast } = useToast();
	const { getToken } = useAuth();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { parseFile, parsedQuestions, summary, parseError, isParsing, dismissInvalidRows, reset } =
		useCsvParser();

	// ─── Step transitions ────────────────────────────────────────────────────────

	const handleFileParsed = (file: File) => {
		parseFile(file);
		setCurrentStep(2);
	};

	const handleBackToUpload = () => {
		reset();
		setCurrentStep(1);
	};

	const handleProceedToContext = () => {
		setCurrentStep(3);
	};

	const handleBackToPreview = () => {
		setCurrentStep(2);
	};

	// ─── Final submission ─────────────────────────────────────────────────────────

	const handleSubmit = async (context: ContextAssignment) => {
		setIsSubmitting(true);
		try {
			const validQuestions = parsedQuestions.filter((q) => q.isValid);

			const payload: BulkCreateQuestionInput[] = validQuestions.map((q) => ({
				questionType: 'mcq',
				statement: q.statement,
				statementFormat: 'text',
				lessonId: context.lessonId,
				chapterId: context.chapterId,
				isMisc: context.isMisc,
				oldExamId: context.oldExamId,
				options: q.options,
			}));

			const token = await getToken();
			const result = await bulkCreateQuestions(payload, token ?? undefined);

			toast({
				title: 'Upload successful!',
				description: `${result.count} question${result.count !== 1 ? 's' : ''} were added to the database.`,
			});

			router.push('/admin/questions');
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
			toast({
				title: 'Upload failed',
				description: message,
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// ─── Card titles per step ────────────────────────────────────────────────────

	const stepMeta = {
		1: {
			title: 'Upload your CSV file',
			description: 'Drag and drop or browse for a CSV file containing your questions.',
		},
		2: {
			title: 'Preview & Validate',
			description: 'Review the parsed questions and fix or dismiss any errors before continuing.',
		},
		3: {
			title: 'Assign Context',
			description:
				'Choose where in the curriculum this batch of questions will be attached. This applies to all questions in the batch.',
		},
	} as const;

	const meta = stepMeta[currentStep as keyof typeof stepMeta];

	return (
		<div className="p-8 max-w-3xl mx-auto space-y-8">
			{/* Page header */}
			<div className="flex items-center gap-4">
				<Link href="/admin/questions">
					<Button variant="ghost" size="sm" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Questions
					</Button>
				</Link>
				<div>
					<h1 className="text-2xl font-bold">Bulk Upload Questions</h1>
					<p className="text-sm text-muted-foreground mt-0.5">
						Import multiple questions at once from a CSV file
					</p>
				</div>
			</div>

			{/* Progress steps */}
			<UploadProgressSteps currentStep={currentStep} />

			{/* Step card */}
			<Card>
				<CardHeader>
					<CardTitle>{meta.title}</CardTitle>
					<CardDescription>{meta.description}</CardDescription>
				</CardHeader>
				<CardContent>
					{/* Parse error banner */}
					{parseError && (
						<div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
							<strong>Parse error:</strong> {parseError}
						</div>
					)}

					{currentStep === 1 && (
						<StepUploadFile onFileParsed={handleFileParsed} isParsing={isParsing} />
					)}

					{currentStep === 2 && (
						<StepPreviewTable
							questions={parsedQuestions}
							summary={summary}
							onDismissInvalid={dismissInvalidRows}
							onNext={handleProceedToContext}
							onBack={handleBackToUpload}
						/>
					)}

					{currentStep === 3 && (
						<StepContextAssignment
							validCount={parsedQuestions.filter((q) => q.isValid).length}
							onBack={handleBackToPreview}
							onSubmit={handleSubmit}
							isSubmitting={isSubmitting}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
