export interface CalendarDay {
	date: Date;
	isoDate: string;
	isCurrentMonth: boolean;
	isToday: boolean;
}

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

export function toIsoDate(date: Date): string {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function parseIsoDate(isoDate: string): Date {
	const [year, month, day] = isoDate.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

export function startOfMonth(date: Date): Date {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function addMonths(baseDate: Date, delta: number): Date {
	return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth() + delta, 1));
}

function addDays(baseDate: Date, delta: number): Date {
	return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate() + delta));
}

function startOfWeek(date: Date): Date {
	const weekday = date.getUTCDay();
	return addDays(date, -weekday);
}

export function isSameMonth(left: Date, right: Date): boolean {
	return left.getUTCFullYear() === right.getUTCFullYear() && left.getUTCMonth() === right.getUTCMonth();
}

export function buildMonthGrid(monthAnchor: Date): CalendarDay[] {
	const todayIso = toIsoDate(new Date());
	const monthStart = startOfMonth(monthAnchor);
	const gridStart = startOfWeek(monthStart);

	return Array.from({ length: 42 }, (_, index) => {
		const date = addDays(gridStart, index);
		const isoDate = toIsoDate(date);

		return {
			date,
			isoDate,
			isCurrentMonth: isSameMonth(date, monthAnchor),
			isToday: isoDate === todayIso,
		};
	});
}

export function formatLongDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function formatMonthLabel(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export function monthRange(monthAnchor: Date): { from: string; to: string } {
	const fromDate = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth(), 1));
	const toDate = new Date(Date.UTC(monthAnchor.getUTCFullYear(), monthAnchor.getUTCMonth() + 1, 0));

	return {
		from: toIsoDate(fromDate),
		to: toIsoDate(toDate),
	};
}
