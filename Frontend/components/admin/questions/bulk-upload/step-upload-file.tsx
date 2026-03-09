'use client';

import { useRef, useState, useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepUploadFileProps {
	onFileParsed: (file: File) => void;
	isParsing: boolean;
}

const EXPECTED_CSV_FORMAT = `question_text,option_1,option_2,option_3,option_4,correct_answer`;
const EXAMPLE_ROWS = [
	`"What is 2+2?","1","2","4","5","C"`,
	`"Capital of Egypt?","Paris","Cairo","London","B"`,
];

export function StepUploadFile({ onFileParsed, isParsing }: StepUploadFileProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleFile = useCallback(
		(file: File) => {
			if (!file.name.endsWith('.csv')) {
				alert('Please upload a .csv file');
				return;
			}
			setSelectedFile(file);
			onFileParsed(file);
		},
		[onFileParsed],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const clearFile = () => {
		setSelectedFile(null);
		if (inputRef.current) inputRef.current.value = '';
	};

	return (
		<div className="space-y-6">
			{/* Drop zone */}
			<div
				className={cn(
					'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center transition-colors cursor-pointer',
					isDragging
						? 'border-primary bg-primary/5'
						: 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30',
					isParsing && 'pointer-events-none opacity-60',
				)}
				onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
				onClick={() => inputRef.current?.click()}
			>
				<input
					ref={inputRef}
					type="file"
					accept=".csv"
					className="hidden"
					onChange={handleInputChange}
				/>
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
					<UploadCloud className="h-6 w-6 text-muted-foreground" />
				</div>
				<div className="space-y-1">
					<p className="text-sm font-medium">
						{isParsing ? 'Parsing your file…' : 'Drop your CSV here, or click to browse'}
					</p>
					<p className="text-xs text-muted-foreground">Only .csv files are accepted</p>
				</div>
				{!isParsing && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
					>
						Browse File
					</Button>
				)}
			</div>

			{/* Selected file pill */}
			{selectedFile && (
				<div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3">
					<FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
					<span className="flex-1 truncate text-sm">{selectedFile.name}</span>
					<span className="text-xs text-muted-foreground">
						{(selectedFile.size / 1024).toFixed(1)} KB
					</span>
					{!isParsing && (
						<button
							type="button"
							onClick={clearFile}
							className="text-muted-foreground hover:text-foreground transition-colors"
							aria-label="Remove file"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
			)}

			{/* CSV format guide */}
			<div className="rounded-lg border bg-muted/30 p-4 space-y-2">
				<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
					Expected CSV Header
				</p>
				<code className="block rounded bg-muted px-3 py-2 text-xs font-mono break-all">
					{EXPECTED_CSV_FORMAT}
				</code>
				<p className="text-xs text-muted-foreground">
					Columns <code>option_5</code>, <code>option_6</code>, … are also supported. Empty option
					columns are automatically skipped. Use <strong>A, B, C, D…</strong> in{' '}
					<code>correct_answer</code>.
				</p>
				<div className="space-y-1 pt-1">
					<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
						Example rows
					</p>
					{EXAMPLE_ROWS.map((row, i) => (
						<code
							key={i}
							className="block rounded bg-muted px-3 py-1.5 text-xs font-mono break-all text-muted-foreground"
						>
							{row}
						</code>
					))}
				</div>
			</div>
		</div>
	);
}
