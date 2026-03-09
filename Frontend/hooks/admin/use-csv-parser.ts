import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import type { QuestionOptionInput } from '@/lib/api/questions';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ParsedQuestion {
	/** 1-based row number (after header) for user-facing error messages */
	rowIndex: number;
	statement: string;
	options: QuestionOptionInput[];
	errors: string[];
	isValid: boolean;
}

export interface ParseSummary {
	total: number;
	valid: number;
	invalid: number;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

/**
 * Maps a letter answer (A, B, C, …) to its 0-based option index.
 * Returns -1 when the letter is out of range.
 */
function letterToIndex(letter: string): number {
	const idx = letter.trim().toUpperCase().charCodeAt(0) - 65; // 'A' = 0
	return idx;
}

/**
 * Normalise a raw CSV row into a `ParsedQuestion`.
 * Handles dynamic option columns: any key starting with "option_" is collected.
 */
function parseRow(
	raw: Record<string, string>,
	rowIndex: number,
): ParsedQuestion {
	const errors: string[] = [];

	// ── Statement ────────────────────────────────────────────────────────────
	const statement = raw['question_text']?.trim() ?? '';
	if (!statement) errors.push('Missing question text');

	// ── Options: collect all option_* columns in order ─────────────────────
	const optionEntries = Object.entries(raw)
		.filter(([key]) => /^option_\d+$/i.test(key))
		.sort(([a], [b]) => {
			const numA = parseInt(a.replace(/\D/g, ''), 10);
			const numB = parseInt(b.replace(/\D/g, ''), 10);
			return numA - numB;
		});

	// Only keep non-empty option values
	const optionTexts = optionEntries
		.map(([, value]) => value?.trim() ?? '')
		.filter(Boolean);

	if (optionTexts.length < 2) {
		errors.push('At least 2 options are required');
	}

	// ── Correct answer ───────────────────────────────────────────────────────
	const correctAnswer = raw['correct_answer']?.trim() ?? '';
	if (!correctAnswer) {
		errors.push('Missing correct answer');
	}

	const correctIdx = letterToIndex(correctAnswer);

	if (correctAnswer && (correctIdx < 0 || correctIdx >= optionTexts.length)) {
		errors.push(
			`Correct answer "${correctAnswer}" is out of range (only ${optionTexts.length} option${optionTexts.length !== 1 ? 's' : ''} provided)`,
		);
	}

	// ── Build options array ──────────────────────────────────────────────────
	const options: QuestionOptionInput[] = optionTexts.map((text, i) => ({
		optionText: text,
		isCorrect: i === correctIdx,
	}));

	const isValid = errors.length === 0;

	return { rowIndex, statement, options, errors, isValid };
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useCsvParser() {
	const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
	const [summary, setSummary] = useState<ParseSummary>({ total: 0, valid: 0, invalid: 0 });
	const [parseError, setParseError] = useState<string | null>(null);
	const [isParsing, setIsParsing] = useState(false);

	const parseFile = useCallback((file: File) => {
		setIsParsing(true);
		setParseError(null);
		setParsedQuestions([]);

		Papa.parse<Record<string, string>>(file, {
			header: true,
			skipEmptyLines: true,
			transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
			complete: (results) => {
				if (results.errors.length > 0 && results.data.length === 0) {
					setParseError(`CSV parse error: ${results.errors[0].message}`);
					setIsParsing(false);
					return;
				}

				const parsed = results.data.map((row, i) => parseRow(row, i + 1));

				const valid = parsed.filter((r) => r.isValid).length;
				setSummary({ total: parsed.length, valid, invalid: parsed.length - valid });
				setParsedQuestions(parsed);
				setIsParsing(false);
			},
			error: (error) => {
				setParseError(error.message);
				setIsParsing(false);
			},
		});
	}, []);

	/** Remove all invalid rows from the list (user confirms dismissal) */
	const dismissInvalidRows = useCallback(() => {
		setParsedQuestions((prev) => {
			const filtered = prev.filter((r) => r.isValid);
			setSummary({ total: filtered.length, valid: filtered.length, invalid: 0 });
			return filtered;
		});
	}, []);

	const reset = useCallback(() => {
		setParsedQuestions([]);
		setSummary({ total: 0, valid: 0, invalid: 0 });
		setParseError(null);
	}, []);

	return {
		parseFile,
		parsedQuestions,
		summary,
		parseError,
		isParsing,
		dismissInvalidRows,
		reset,
	};
}
