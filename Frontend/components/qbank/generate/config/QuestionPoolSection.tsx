import { Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { QuestionStatus } from '@/lib/types/quizzes';

interface QuestionPoolSectionProps {
	value: QuestionStatus;
	onChange: (value: QuestionStatus) => void;
}

const POOL_OPTIONS = [
	{ value: 'all', label: 'All', desc: 'Every matching question' },
	{ value: 'unread', label: 'Unread', desc: 'Never answered before' },
	{ value: 'incorrect_only', label: 'Incorrect', desc: 'Last attempt was wrong' },
] as const;

export function QuestionPoolSection({ value, onChange }: QuestionPoolSectionProps) {
	return (
		<section className="space-y-3">
			<Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
				<Users className="size-3.5" />
				Question Pool
			</Label>
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={1}
				className="grid grid-cols-2   gap-3 w-full"
				value={value}
				onValueChange={(v) => {
					if (!v) return;
					onChange(v as QuestionStatus);
				}}
			>
				{POOL_OPTIONS.map(({ value, label, desc }) => (
					<ToggleGroupItem
						key={value}
						value={value}
						className="flex-col flex-1 items-start gap-0.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-md px-3 py-2.5 border border-border data-[state=on]:border-primary rounded-lg h-auto text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-left transition-all"
					>
						<span className="font-semibold text-xs">{label}</span>
						<span className="font-normal text-[10px] text-muted-foreground leading-tight">
							{desc}
						</span>
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</section>
	);
}
