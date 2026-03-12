import { FileQuestion, Flame, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getUserDashboardStats } from "@/lib/api/stats";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function DashboardStatsSkeleton() {
	return (
		<>
			{[0, 1, 2].map((i) => (
				<Card key={i} className="gap-3 py-4">
					<CardHeader className="flex-row justify-between items-center gap-2 space-y-0 px-4 pt-0 pb-0">
						<Skeleton className="w-28 h-3" />
						<Skeleton className="rounded-md w-7 h-7 shrink-0" />
					</CardHeader>
					<CardContent className="flex flex-col gap-1 px-4">
						<Skeleton className="w-16 h-7" />
						<Skeleton className="w-36 h-3" />
					</CardContent>
				</Card>
			))}
		</>
	);
}

// ─── Main async server component ──────────────────────────────────────────────

export async function DashboardStats() {
	const stats = await getUserDashboardStats();

	const cards = [
		{
			label: "Questions Answered",
			value: stats ? String(stats.totalQuestionsAnswered) : "—",
			icon: FileQuestion,
			hint:
				stats && stats.totalQuestionsAnswered > 0
					? `${stats.totalQuestionsAnswered} unique questions attempted`
					: "Start a test to track your progress",
		},
		{
			label: "Study Streak",
			value: stats ? `${stats.currentStreak}d` : "—",
			icon: Flame,
			hint:
				stats && stats.longestStreak > 0
					? `Best streak: ${stats.longestStreak} days`
					: "Log in daily to build your streak",
		},
		{
			label: "Avg. Score",
			value: stats?.averageScore != null ? `${stats.averageScore.toFixed(1)}%` : "—",
			icon: Target,
			hint:
				stats?.averageScore != null
					? "Across all completed tests"
					: "Complete at least one test to see results",
		},
	];

	return (
		<>
			{cards.map(({ label, value, icon: Icon, hint }) => (
				<Card key={label} className="gap-3 py-4">
					<CardHeader className="flex-row justify-between items-center gap-2 space-y-0 px-4 pt-0 pb-0">
						<CardTitle className="font-medium text-muted-foreground text-xs">{label}</CardTitle>
						<div className="flex justify-center items-center bg-muted rounded-md w-7 h-7 shrink-0">
							<Icon className="w-3.5 h-3.5 text-primary" />
						</div>
					</CardHeader>
					<CardContent className="flex flex-col gap-1 px-4">
						<span className="font-bold text-foreground text-2xl">{value}</span>
						<span className="text-muted-foreground/70 text-xs leading-snug">{hint}</span>
					</CardContent>
				</Card>
			))}
		</>
	);
}
