'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface WizardStep {
	id: number;
	label: string;
}

const STEPS: WizardStep[] = [
	{ id: 1, label: 'Upload File' },
	{ id: 2, label: 'Preview & Validate' },
	{ id: 3, label: 'Assign Context' },
];

interface UploadProgressStepsProps {
	currentStep: number;
}

export function UploadProgressSteps({ currentStep }: UploadProgressStepsProps) {
	return (
		<nav aria-label="Upload wizard steps">
			<ol className="flex items-center gap-0">
				{STEPS.map((step, index) => {
					const isCompleted = step.id < currentStep;
					const isActive = step.id === currentStep;

					return (
						<li key={step.id} className="flex items-center flex-1">
							{/* Step indicator */}
							<div className="flex flex-col items-center gap-1.5">
								<div
									className={cn(
										'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
										isCompleted
											? 'border-primary bg-primary text-primary-foreground'
											: isActive
												? 'border-primary bg-background text-primary'
												: 'border-muted-foreground/30 bg-background text-muted-foreground',
									)}
								>
									{isCompleted ? <Check className="h-4 w-4" /> : step.id}
								</div>
								<span
									className={cn(
										'text-xs font-medium whitespace-nowrap',
										isActive ? 'text-foreground' : 'text-muted-foreground',
									)}
								>
									{step.label}
								</span>
							</div>

							{/* Connector line — not after the last step */}
							{index < STEPS.length - 1 && (
								<div
									className={cn(
										'h-0.5 flex-1 mx-3 mb-5 transition-colors',
										isCompleted ? 'bg-primary' : 'bg-muted-foreground/20',
									)}
								/>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
