"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	buildMonthGrid,
	formatMonthLabel,
	parseIsoDate,
	startOfMonth,
	type CalendarDay,
} from "@/components/planner/date-utils";

interface PlannerDayPickerProps {
	monthAnchor: Date;
	selectedDate: string;
	onSelectDate: (isoDate: string) => void;
	onMonthChange: (nextMonth: Date) => void;
	disabled?: boolean;
}

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const utcLongDateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeZone: "UTC" });

function dayButtonClass(day: CalendarDay, selectedDate: string): string {
	const isSelected = day.isoDate === selectedDate;

	return cn(
		"size-9 rounded-md border text-sm font-medium transition-colors",
		day.isCurrentMonth ? "border-transparent" : "border-transparent text-muted-foreground",
		day.isToday && !isSelected ? "border-primary/40" : null,
		isSelected
			? "border-primary bg-primary text-primary-foreground"
			: "hover:border-border hover:bg-muted/60",
	);
}

export function PlannerDayPicker({
	monthAnchor,
	selectedDate,
	onSelectDate,
	onMonthChange,
	disabled = false,
}: PlannerDayPickerProps) {
	const days = buildMonthGrid(monthAnchor);

	function handleSelectDay(day: CalendarDay) {
		onSelectDate(day.isoDate);

		if (!day.isCurrentMonth) {
			onMonthChange(startOfMonth(day.date));
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<div>
						<CardTitle>Calendar</CardTitle>
						<CardDescription>Select a date to manage that day&apos;s study tasks.</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onClick={() =>
								onMonthChange(
									new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() - 1, 1)),
								)
							}
							disabled={disabled}
							aria-label="Previous month"
						>
							<ChevronLeft />
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon-sm"
							onClick={() =>
								onMonthChange(
									new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + 1, 1)),
								)
							}
							disabled={disabled}
							aria-label="Next month"
						>
							<ChevronRight />
						</Button>
					</div>
				</div>
				<p className="text-sm font-medium">{formatMonthLabel(monthAnchor)}</p>
			</CardHeader>
			<CardContent className="px-4 pb-4">
				<div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
					{weekdayLabels.map((label) => (
						<span key={label} className="py-1 font-medium">
							{label}
						</span>
					))}
				</div>
				<div className="mt-1 grid grid-cols-7 gap-1">
					{days.map((day) => (
						<button
							key={day.isoDate}
							type="button"
							className={dayButtonClass(day, selectedDate)}
							onClick={() => handleSelectDay(day)}
							disabled={disabled}
							aria-pressed={day.isoDate === selectedDate}
							aria-label={`Select ${utcLongDateFormatter.format(parseIsoDate(day.isoDate))}`}
						>
							{day.date.getUTCDate()}
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
