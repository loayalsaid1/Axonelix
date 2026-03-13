import { BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TestTitleSectionProps {
	value: string;
	onChange: (value: string) => void;
}

export function TestTitleSection({ value, onChange }: TestTitleSectionProps) {
	return (
		<section className="space-y-2">
			<Label
				htmlFor="quiz-title"
				className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider"
			>
				<BookOpen className="size-3.5" />
				Test Title
				<span className="font-normal text-[10px] text-muted-foreground/50 normal-case">
					(optional)
				</span>
			</Label>
			<Input
				id="quiz-title"
				placeholder="e.g. Cardiology mid-session review…"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-9"
			/>
		</section>
	);
}
