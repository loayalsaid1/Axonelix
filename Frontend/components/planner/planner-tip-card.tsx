import { Card, CardContent } from "@/components/ui/card";

export function PlannerTipCard() {
	return (
		<Card className="mt-auto">
			<CardContent className="py-4">
				<p className="text-center text-sm text-muted-foreground">
					Planner tip: keep tasks short and specific. For example, replace “Study anatomy” with “Review brachial plexus mnemonics (30 min)”.
				</p>
			</CardContent>
		</Card>
	);
}
