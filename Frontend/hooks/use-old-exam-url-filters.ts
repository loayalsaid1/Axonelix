'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ExamType, SubjectType } from '@/lib/types/old-exams';
import {
	OLD_EXAMS_URL_QUERY_KEYS,
	parseOldExamUrlFilters,
} from '@/lib/old-exams/query-params';

export function useOldExamUrlFilters() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const urlParams = useMemo(
		() => new URLSearchParams(searchParams.toString()),
		[searchParams],
	);

	const { moduleId, subjectType, examType } = useMemo(
		() => parseOldExamUrlFilters(urlParams),
		[urlParams],
	);

	const pushParams = useCallback(
		(params: URLSearchParams) => {
			const query = params.toString();
			router.push(query ? `${pathname}?${query}` : pathname);
		},
		[pathname, router],
	);

	const updateParam = useCallback(
		(key: string, value: string | undefined) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value != null) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
			pushParams(params);
		},
		[searchParams, pushParams],
	);

	const setModuleId = useCallback(
		(id: number | undefined) =>
			updateParam(
				OLD_EXAMS_URL_QUERY_KEYS.moduleId,
				id != null ? String(id) : undefined,
			),
		[updateParam],
	);

	const setSubjectType = useCallback(
		(type: SubjectType | undefined) =>
			updateParam(OLD_EXAMS_URL_QUERY_KEYS.subjectType, type),
		[updateParam],
	);

	const setExamType = useCallback(
		(type: ExamType | undefined) =>
			updateParam(OLD_EXAMS_URL_QUERY_KEYS.examType, type),
		[updateParam],
	);

	const resetFilters = useCallback(() => {
		const params = new URLSearchParams(searchParams.toString());
		params.delete(OLD_EXAMS_URL_QUERY_KEYS.moduleId);
		params.delete(OLD_EXAMS_URL_QUERY_KEYS.subjectType);
		params.delete(OLD_EXAMS_URL_QUERY_KEYS.examType);
		pushParams(params);
	}, [searchParams, pushParams]);

	return {
		moduleId,
		subjectType,
		examType,
		setModuleId,
		setSubjectType,
		setExamType,
		resetFilters,
	};
}
