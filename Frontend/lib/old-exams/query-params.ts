import {
	EXAM_TYPES,
	SUBJECT_TYPES,
	type ExamType,
	type SubjectType,
} from '@/lib/types/old-exams';

export const OLD_EXAMS_URL_QUERY_KEYS = {
	moduleId: 'moduleId',
	subjectType: 'subjectType',
	examType: 'examType',
} as const;

export const OLD_EXAMS_API_QUERY_KEYS = {
	moduleId: 'moduleId',
	moduleType: 'moduleType',
	examType: 'examType',
} as const;

const EXAM_TYPE_SET: ReadonlySet<string> = new Set(EXAM_TYPES);
const SUBJECT_TYPE_SET: ReadonlySet<string> = new Set(SUBJECT_TYPES);

export interface OldExamUrlFilters {
	moduleId?: number;
	subjectType?: SubjectType;
	examType?: ExamType;
}

function parseOptionalNumber(value: string | null): number | undefined {
	if (!value) return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSubjectType(value: string | null): SubjectType | undefined {
	if (!value || !SUBJECT_TYPE_SET.has(value)) return undefined;
	return value as SubjectType;
}

function parseExamType(value: string | null): ExamType | undefined {
	if (!value || !EXAM_TYPE_SET.has(value)) return undefined;
	return value as ExamType;
}

export function parseOldExamUrlFilters(params: URLSearchParams): OldExamUrlFilters {
	return {
		moduleId: parseOptionalNumber(params.get(OLD_EXAMS_URL_QUERY_KEYS.moduleId)),
		subjectType: parseSubjectType(params.get(OLD_EXAMS_URL_QUERY_KEYS.subjectType)),
		examType: parseExamType(params.get(OLD_EXAMS_URL_QUERY_KEYS.examType)),
	};
}
