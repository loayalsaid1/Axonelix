import Link from 'next/link';
import { Lock, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ModuleLockedPaywallProps {
	lessonName: string;
	moduleName: string;
	subjectName?: string;
	chapterName?: string;
}

export function ModuleLockedPaywall({
	lessonName,
	moduleName,
	subjectName,
	chapterName,
}: ModuleLockedPaywallProps) {
	return (
		<div className="bg-card p-6 border rounded-2xl">
			<div className="flex items-center gap-2 mb-4 text-muted-foreground">
				<Lock className="size-5" />
				<Badge variant="secondary" className="font-semibold text-xs uppercase tracking-wide">
					Locked Content
				</Badge>
			</div>

			<div className="space-y-1">
				<h2 className="font-semibold text-xl tracking-tight">{lessonName}</h2>
				<p className="text-muted-foreground text-sm">
					Module: <span className="font-medium text-foreground">{moduleName}</span>
					{subjectName ? <span> • Subject: <span className="font-medium text-foreground">{subjectName}</span></span> : null}
					{chapterName ? <span> • Chapter: <span className="font-medium text-foreground">{chapterName}</span></span> : null}
				</p>
			</div>

			<div className="mt-4 pt-4 border-t">
				<div className="flex items-center gap-2 mb-2 text-muted-foreground">
					<Lock className="size-4" />
					<p className="font-semibold text-sm uppercase tracking-wide">Module Access Required</p>
				</div>

				<p className="text-muted-foreground text-sm leading-relaxed">
					You do not currently have an active subscription for this module. Purchase access to unlock this lesson and all
					related subjects, chapters, and quiz questions.
				</p>
			</div>

			<div className="flex flex-wrap gap-3 mt-6">
				<Button asChild>
					<Link href="/payments/request" className="inline-flex items-center gap-2">
						<ShoppingCart className="size-4" />
						Unlock Module
					</Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/library/modules">Back to Modules</Link>
				</Button>
			</div>
		</div>
	);
}
