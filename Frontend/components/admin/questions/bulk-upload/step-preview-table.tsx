'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ParsedQuestion, ParseSummary } from '@/hooks/admin/use-csv-parser';

interface StepPreviewTableProps {
	questions: ParsedQuestion[];
	summary: ParseSummary;
	onDismissInvalid: () => void;
	onNext: () => void;
	onBack: () => void;
}

export function StepPreviewTable({
	questions,
	summary,
	onDismissInvalid,
	onNext,
	onBack,
}: StepPreviewTableProps) {
	const [expandedRow, setExpandedRow] = useState<number | null>(null);
	const canProceed = summary.invalid === 0;

	return (
		<div className="space-y-5">
			{/* Summary bar */}
			<div className="flex flex-wrap gap-3 items-center rounded-lg border bg-muted/30 px-4 py-3">
				<div className="flex items-center gap-2 text-sm">
					<span className="font-medium">Found {summary.total} question{summary.total !== 1 ? 's' : ''}:</span>
					<span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
						<CheckCircle2 className="h-3.5 w-3.5" />
						{summary.valid} valid
					</span>
					{summary.invalid > 0 && (
						<span className="flex items-center gap-1 text-destructive font-medium">
							<AlertCircle className="h-3.5 w-3.5" />
							{summary.invalid} with errors
						</span>
					)}
				</div>

				{summary.invalid > 0 && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="ml-auto text-destructive border-destructive/40 hover:bg-destructive/10"
						onClick={onDismissInvalid}
					>
						Dismiss {summary.invalid} Invalid Row{summary.invalid !== 1 ? 's' : ''}
					</Button>
				)}
			</div>

			{/* Table */}
			<ScrollArea className="h-[380px] rounded-lg border">
				<Table>
					<TableHeader className="sticky top-0 bg-background z-10">
						<TableRow>
							<TableHead className="w-12">#</TableHead>
							<TableHead>Question Text</TableHead>
							<TableHead className="w-24 text-center">Options</TableHead>
							<TableHead className="w-28 text-center">Status</TableHead>
							<TableHead className="w-10" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{questions.map((q) => (
							<>
								<TableRow
									key={`row-${q.rowIndex}`}
									className={cn(
										'cursor-pointer transition-colors',
										!q.isValid && 'bg-destructive/5 hover:bg-destructive/10',
									)}
									onClick={() =>
										setExpandedRow(expandedRow === q.rowIndex ? null : q.rowIndex)
									}
								>
									<TableCell className="text-muted-foreground text-xs">{q.rowIndex}</TableCell>
									<TableCell className="max-w-xs">
										<p className="truncate text-sm">{q.statement || <em className="text-muted-foreground">empty</em>}</p>
									</TableCell>
									<TableCell className="text-center text-sm">{q.options.length}</TableCell>
									<TableCell className="text-center">
										{q.isValid ? (
											<Badge variant="outline" className="text-green-600 border-green-600/30 bg-green-50 dark:bg-green-950/30">
												Valid
											</Badge>
										) : (
											<Badge variant="destructive" className="gap-1">
												<AlertCircle className="h-3 w-3" />
												Error
											</Badge>
										)}
									</TableCell>
									<TableCell>
										{expandedRow === q.rowIndex ? (
											<ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
										) : (
											<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
										)}
									</TableCell>
								</TableRow>

								{/* Expanded details */}
								{expandedRow === q.rowIndex && (
									<TableRow key={`details-${q.rowIndex}`} className={cn(!q.isValid && 'bg-destructive/5')}>
										<TableCell colSpan={5} className="pt-0 pb-3 px-4">
											<div className="space-y-2 pl-10">
												{/* Options preview */}
												<div className="flex flex-wrap gap-1.5">
													{q.options.map((opt, i) => (
														<span
															key={i}
															className={cn(
																'rounded px-2 py-0.5 text-xs border',
																opt.isCorrect
																	? 'border-green-500/40 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 font-medium'
																	: 'border-muted bg-muted/40 text-muted-foreground',
															)}
														>
															{String.fromCharCode(65 + i)}. {opt.optionText}
														</span>
													))}
												</div>
												{/* Errors */}
												{q.errors.map((err, i) => (
													<p key={i} className="flex items-center gap-1.5 text-xs text-destructive">
														<AlertCircle className="h-3 w-3 shrink-0" />
														{err}
													</p>
												))}
											</div>
										</TableCell>
									</TableRow>
								)}
							</>
						))}
					</TableBody>
				</Table>
			</ScrollArea>

			{!canProceed && (
				<p className="text-sm text-muted-foreground text-center">
					Fix or dismiss all invalid rows before proceeding.
				</p>
			)}

			{/* Navigation */}
			<div className="flex justify-between pt-2">
				<Button type="button" variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button type="button" onClick={onNext} disabled={!canProceed || questions.length === 0}>
					Next: Assign Context
				</Button>
			</div>
		</div>
	);
}
