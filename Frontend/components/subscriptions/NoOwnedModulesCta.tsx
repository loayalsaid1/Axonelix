import Link from "next/link";
import { CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoOwnedModulesCtaProps {
	compact?: boolean;
	className?: string;
}

export function NoOwnedModulesCta({ compact = false, className }: NoOwnedModulesCtaProps) {
	return (
		<div
			className={cn(
				"rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3",
				"text-sidebar-foreground",
				className
			)}
		>
			<div className="flex items-start gap-2">
				<Sparkles className="mt-0.5 size-4 text-sidebar-foreground/70 shrink-0" />
				<div className="space-y-2">
					<div>
						<p className="font-medium text-sm">No modules unlocked yet</p>
						<p className="text-sidebar-foreground/70 text-xs leading-relaxed">
							Start by requesting your first module access.
							{!compact && " After approval, your lessons and question bank will appear automatically."}
						</p>
					</div>

					<div className="flex items-center gap-2">
						<Button asChild size="sm" className="h-8 text-xs">
							<Link href="/payments/request">
								<CreditCard className="mr-1.5 size-3.5" />
								Request Access
							</Link>
						</Button>

						{!compact && (
							<Link
								href="/payments"
								className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-xs underline-offset-2 hover:underline"
							>
								View Payments
							</Link>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
