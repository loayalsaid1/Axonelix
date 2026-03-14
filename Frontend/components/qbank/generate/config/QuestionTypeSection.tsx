import { HelpCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { QuestionType } from '@/lib/types/quizzes';

interface QuestionTypeSectionProps {
	value: QuestionType | null;
	onChange: (value: QuestionType | null) => void;
}

const TYPE_OPTIONS = [
	{ value: 'mixed', label: 'Mixed', icon: '📋' },
	{ value: 'mcq', label: 'MCQ', icon: '🔘' },
	{ value: 'written', label: 'Written', icon: '✍️' },
] as const;

export function QuestionTypeSection({ value, onChange }: QuestionTypeSectionProps) {
	return (
		<section className="space-y-3">
			<Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
				<HelpCircle className="size-3.5" />
				Question Type
			</Label>
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={1}
				className="grid grid-cols-3 gap-3 w-full"
				value={value ?? 'mixed'}
				onValueChange={(v) => {
					if (!v) return;
					onChange(v === 'mixed' ? null : (v as QuestionType));
				}}
			>
				{TYPE_OPTIONS.map(({ value, label, icon }) => (
					<ToggleGroupItem
						key={value}
						value={value}
						className="flex-col flex-1 items-center gap-1.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-2 py-3 border border-border data-[state=on]:border-primary rounded-lg h-auto font-medium text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-sm transition-all"
					>
						<span className="text-base">{icon}</span>
						<span>{label}</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</section>
	);
}
