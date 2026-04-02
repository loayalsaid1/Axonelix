import { CalendarClock } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PlannerHeaderCard() {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-start gap-3">
					<div className="rounded-md bg-primary/10 p-2 text-primary">
						<CalendarClock className="size-5" />
					</div>
					<div className="space-y-1">
						<CardTitle>Study Planner</CardTitle>
						<CardDescription>
							Use the calendar to pick a day, then manage that day&apos;s study tasks from the task panel.
						</CardDescription>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
