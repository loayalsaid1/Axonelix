import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/use-debounce';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { ModuleName } from '@/lib/types/materials';
import type {
	ListAdminPaymentRequestsParams,
	PaymentRequestStatus,
} from '@/lib/types/subscriptions';

interface PaymentRequestFiltersProps {
	filters: ListAdminPaymentRequestsParams;
	modules: ModuleName[];
	onChange: (next: Partial<ListAdminPaymentRequestsParams>) => void;
}

const ALL_STATUSES = [
	{ label: 'All statuses', value: 'all' },
	{ label: 'Pending', value: 'pending' },
	{ label: 'Approved', value: 'approved' },
	{ label: 'Rejected', value: 'rejected' },
	{ label: 'Canceled', value: 'canceled' },
] as const;

export function PaymentRequestFilters({
	filters,
	modules,
	onChange,
}: PaymentRequestFiltersProps) {
	const [queryInput, setQueryInput] = useState(filters.query ?? '');
	const debouncedQuery = useDebounce(queryInput, 350);

	useEffect(() => {
		setQueryInput(filters.query ?? '');
	}, [filters.query]);

	useEffect(() => {
		const currentQuery = filters.query ?? '';
		if (debouncedQuery === currentQuery) return;

		onChange({ query: debouncedQuery, page: 1 });
	}, [debouncedQuery, filters.query, onChange]);

	return (
		<div className="grid grid-cols-1 gap-4 rounded-xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-5">
			<div className="space-y-2 xl:col-span-2">
				<Label htmlFor="payment-search">Search</Label>
				<div className="relative">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						id="payment-search"
						placeholder="Request ID, student email, module"
						value={queryInput}
						onChange={(event) => setQueryInput(event.target.value)}
						className="pl-8"
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Status</Label>
				<Select
					value={filters.status ?? 'all'}
					onValueChange={(value) =>
						onChange({
							status: value === 'all' ? undefined : (value as PaymentRequestStatus),
							page: 1,
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="All statuses" />
					</SelectTrigger>
					<SelectContent>
						{ALL_STATUSES.map((status) => (
							<SelectItem key={status.value} value={status.value}>
								{status.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label>Module</Label>
				<Select
					value={filters.moduleId != null ? String(filters.moduleId) : 'all'}
					onValueChange={(value) =>
						onChange({
							moduleId: value === 'all' ? undefined : Number(value),
							page: 1,
						})
					}
				>
					<SelectTrigger className="max-w-full">
						<SelectValue placeholder="All modules" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All modules</SelectItem>
						{modules.map((module) => (
							<SelectItem key={module.id} value={String(module.id)}>
								{module.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="payments-from-date">From date</Label>
				<Input
					id="payments-from-date"
					type="date"
					value={filters.fromDate ?? ''}
					onChange={(event) => onChange({ fromDate: event.target.value || undefined, page: 1 })}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="payments-to-date">To date</Label>
				<Input
					id="payments-to-date"
					type="date"
					value={filters.toDate ?? ''}
					onChange={(event) => onChange({ toDate: event.target.value || undefined, page: 1 })}
				/>
			</div>
		</div>
	);
}
