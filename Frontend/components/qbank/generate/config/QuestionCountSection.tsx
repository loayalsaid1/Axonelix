import { Clock, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface AvailableCountBadgeProps {
	count: number | null;
	loading: boolean;
	questionCount: number;
}

function AvailableCountBadge({ count, loading, questionCount }: AvailableCountBadgeProps) {
	if (loading) {
		return (
			<Badge variant="secondary" className="gap-1.5 h-5 font-normal text-xs">
				<Loader2 className="size-3 animate-spin" />
				Counting…
			</Badge>
		);
	}
	if (count === null) return null;

	const canGenerate = count >= questionCount;

	return (
		<Badge
			variant="outline"
			className={
				canGenerate
					? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 h-5 text-xs font-medium'
					: 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 h-5 text-xs font-medium'
			}
		>
			{count.toLocaleString()} available
		</Badge>
	);
}

interface QuestionCountSectionProps {
	count: number;
	availableCount: number | null;
	isCountLoading: boolean;
	onChange: (value: number) => void;
}

export function QuestionCountSection({ count, availableCount, isCountLoading, onChange }: QuestionCountSectionProps) {
	const maxAvailable = Math.min(40, availableCount || Infinity);

	return (
		<section className="space-y-4">
			<div className="flex justify-between items-center">
				<Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
					<Clock className="size-3.5" />
					Number of Questions
				</Label>
				<div className="flex items-center gap-3">
					<span className="font-bold tabular-nums text-primary text-2xl">
						{count}
					</span>
					<AvailableCountBadge
						count={availableCount}
						loading={isCountLoading}
						questionCount={count}
					/>
				</div>
			</div>

			<Slider
				min={1}
				max={maxAvailable}
				step={1}
				value={[count]}
				onValueChange={([v]) => onChange(v)}
				className="w-full"
			/>

			<div className="flex justify-between text-[10px] text-muted-foreground/50">
				<span>1</span>
				<span>{maxAvailable}</span>
			</div>
		</section>
	);
}
