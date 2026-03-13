import { ToggleLeft } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const MODE_OPTIONS = [
	{ value: 'tutor', label: 'Tutor', icon: '📖' },
	{ value: 'timed', label: 'Timed', icon: '⏱️' },
] as const;

export function TestModeSection() {
	return (
		<section className="space-y-3 opacity-50 pointer-events-none select-none">
			<Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
				<ToggleLeft className="size-3.5" />
				Test Mode
				<Tooltip>
					<TooltipTrigger asChild>
						<Badge variant="outline" className="px-1.5 h-4 text-[9px] cursor-default">
							Coming soon
						</Badge>
					</TooltipTrigger>
					<TooltipContent side="right">
						Timed mode is not yet available.
					</TooltipContent>
				</Tooltip>
			</Label>
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={1}
				className="grid grid-cols-2 gap-3 w-full"
				value="tutor"
				onValueChange={() => { }}
			>
				{MODE_OPTIONS.map(({ value, label, icon }) => (
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
