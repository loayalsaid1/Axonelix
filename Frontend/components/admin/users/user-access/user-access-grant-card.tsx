import { ShieldPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { ModuleName } from '@/lib/types/materials';

interface UserAccessGrantCardProps {
	grantableModules: ModuleName[];
	selectedModuleId: string;
	submitting: boolean;
	onModuleChange: (value: string) => void;
	onGrant: () => void;
}

export function UserAccessGrantCard({
	grantableModules,
	selectedModuleId,
	submitting,
	onModuleChange,
	onGrant,
}: UserAccessGrantCardProps) {
	const hasGrantableModules = grantableModules.length > 0;
	const selectedGrantModule = grantableModules.find(
		(module) => String(module.id) === selectedModuleId,
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Grant Access</CardTitle>
				<CardDescription>
					Grant access to one module for this user without payment review.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
				<div className="w-full space-y-2">
					<Label>Module</Label>
					{hasGrantableModules ? (
						<Select
							value={selectedModuleId || undefined}
							onValueChange={onModuleChange}
							disabled={submitting}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select module" />
							</SelectTrigger>
							<SelectContent>
								{grantableModules.map((module) => (
									<SelectItem key={module.id} value={String(module.id)}>
										{module.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					) : (
						<div className="flex h-10 w-fit items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
							No more modules available to grant
						</div>
					)}
				</div>
				<Button className="gap-2" onClick={onGrant} disabled={submitting || !selectedGrantModule}>
					<ShieldPlus className="h-4 w-4" />
					{submitting ? 'Granting...' : 'Grant Access'}
				</Button>
			</CardContent>
		</Card>
	);
}
