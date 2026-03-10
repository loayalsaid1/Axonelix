import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
	return (
		<div className="p-8">
			{/* Header skeleton */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
				<div className="space-y-2">
					<Skeleton className="rounded h-9 w-52" />
					<Skeleton className="rounded h-4 w-96" />
				</div>
			</div>

			{/* Nav cards skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{[0, 1].map((i) => (
					<div
						key={i}
						className="rounded-xl border bg-card p-6 space-y-4"
					>
						<div className="flex items-center gap-3">
							<Skeleton className="rounded-lg h-10 w-10" />
							<div className="space-y-1.5">
								<Skeleton className="rounded h-5 w-28" />
								<Skeleton className="rounded h-3.5 w-36" />
							</div>
						</div>
						<Skeleton className="rounded h-4 w-full" />
						<Skeleton className="rounded h-4 w-4/5" />
						<Skeleton className="rounded h-3.5 w-48 mt-2" />
					</div>
				))}

				{/* Quick tips skeleton */}
				<div className="rounded-xl border bg-card p-6 space-y-4">
					<Skeleton className="rounded h-5 w-28" />
					<div className="space-y-3">
						{[0, 1, 2].map((i) => (
							<div key={i} className="flex items-start gap-2">
								<Skeleton className="rounded-full h-4 w-4 mt-0.5 shrink-0" />
								<Skeleton className="rounded h-4 w-full" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
