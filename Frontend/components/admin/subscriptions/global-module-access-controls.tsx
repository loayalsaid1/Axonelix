'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useApiFetch } from '@/hooks/use-api-fetch';
import {
	grantGlobalModuleAccess,
	revokeGlobalModuleAccess,
} from '@/lib/api/subscriptions';
import type { ModuleName } from '@/lib/types/materials';
import type {
	GlobalModuleAccessMutationResult,
	GlobalModuleAccessScope,
} from '@/lib/types/subscriptions';

interface GlobalModuleAccessControlsProps {
	modules: ModuleName[];
	onMutationCompleted?: (result: GlobalModuleAccessMutationResult) => void;
}

interface GlobalAccessActionCardProps {
	action: 'grant' | 'revoke';
	modules: ModuleName[];
	onMutationCompleted?: (result: GlobalModuleAccessMutationResult) => void;
}

function GlobalAccessActionCard({
	action,
	modules,
	onMutationCompleted,
}: GlobalAccessActionCardProps) {
	const authFetch = useApiFetch();
	const [scope, setScope] = useState<GlobalModuleAccessScope>('all_modules');
	const [moduleId, setModuleId] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [lastResult, setLastResult] = useState<GlobalModuleAccessMutationResult | null>(null);

	const selectedModule = useMemo(
		() => modules.find((module) => String(module.id) === moduleId) ?? null,
		[moduleId, modules],
	);

	const actionLabel = action === 'grant' ? 'Grant' : 'Revoke';
	const actionIcon = action === 'grant' ? ShieldCheck : ShieldX;
	const buttonVariant = action === 'grant' ? 'default' : 'destructive';
	const cardTone = action === 'grant' ? '' : 'border-destructive/30';

	const execute = async () => {
		const selectedModuleId = moduleId ? Number(moduleId) : undefined;

		if (scope === 'single_module' && !selectedModuleId) {
			toast.error('Please select a module first.');
			return;
		}

		try {
			setSubmitting(true);

			const result =
				action === 'grant'
					? await grantGlobalModuleAccess(
						scope === 'single_module' ? { moduleId: selectedModuleId } : {},
						authFetch,
					)
					: await revokeGlobalModuleAccess(
						scope === 'single_module' ? { moduleId: selectedModuleId } : {},
						authFetch,
					);

			setLastResult(result);
			setConfirmOpen(false);
			onMutationCompleted?.(result);

			toast.success(
				`${actionLabel} completed. ${result.affectedAccessRows} access rows changed across ${result.affectedUsers} users.`,
			);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : `Failed to ${action} access.`);
		} finally {
			setSubmitting(false);
		}
	};

	const Icon = actionIcon;

	return (
		<Card className={cardTone}>
			<CardHeader className="space-y-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Icon className="h-4 w-4" />
					Global {actionLabel}
				</CardTitle>
				<CardDescription>
					{action === 'grant'
						? 'Grant active module access to all students across a selected scope.'
						: 'Revoke active module access for all students across a selected scope.'}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="space-y-2">
					<Label>Scope</Label>
					<RadioGroup
						value={scope}
						onValueChange={(value) => setScope(value as GlobalModuleAccessScope)}
					>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="all_modules" id={`${action}-all-modules`} />
							<Label htmlFor={`${action}-all-modules`} className="font-normal">
								All modules for all students
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="single_module" id={`${action}-single-module`} />
							<Label htmlFor={`${action}-single-module`} className="font-normal">
								One module for all students
							</Label>
						</div>
					</RadioGroup>
				</div>

				{scope === 'single_module' && (
					<div className="space-y-2">
						<Label>Module</Label>
						<Select value={moduleId || undefined} onValueChange={setModuleId}>
							<SelectTrigger className="max-w-full">
								<SelectValue placeholder="Select module" />
							</SelectTrigger>
							<SelectContent>
								{modules.map((module) => (
									<SelectItem key={module.id} value={String(module.id)}>
										{module.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}

				<AlertDialog
					open={confirmOpen}
					onOpenChange={(nextOpen) => {
						if (submitting) return;
						setConfirmOpen(nextOpen);
					}}
				>
					<AlertDialogTrigger asChild>
						<Button variant={buttonVariant} className="w-full">
							{actionLabel} Access
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Confirm Global {actionLabel}
							</AlertDialogTitle>
							<AlertDialogDescription>
								{scope === 'all_modules'
									? `This will ${action} active access for all modules across all students.`
									: `This will ${action} active access for ${selectedModule?.name ?? 'the selected module'} across all students.`}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
							<Button
								type="button"
								variant={buttonVariant}
								onClick={execute}
								disabled={submitting}
							>
								{submitting ? `${actionLabel}ing...` : `Confirm ${actionLabel}`}
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{lastResult && (
					<p className="text-xs text-muted-foreground">
						Last run affected {lastResult.affectedAccessRows} access rows across{' '}
						{lastResult.affectedUsers} users.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export function GlobalModuleAccessControls({
	modules,
	onMutationCompleted,
}: GlobalModuleAccessControlsProps) {
	return (
		<section className="space-y-3">
			<div>
				<h2 className="text-lg font-semibold tracking-tight">Global Access Controls</h2>
				<p className="text-sm text-muted-foreground">
					Run platform-wide module access operations for all students.
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
				<GlobalAccessActionCard
					action="grant"
					modules={modules}
					onMutationCompleted={onMutationCompleted}
				/>
				<GlobalAccessActionCard
					action="revoke"
					modules={modules}
					onMutationCompleted={onMutationCompleted}
				/>
			</div>
		</section>
	);
}
