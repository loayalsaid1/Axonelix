import { useState, useCallback } from 'react';
import { useApiFetch } from '../use-api-fetch';

export interface QuestionAncestors {
	moduleId: string;
	subjectId: string;
	chapterId: string;
}

// API Response Types
interface LessonResponse {
	chapter?: {
		id: number;
		subject?: {
			id: number;
			module?: {
				id: number;
			};
		};
	};
}

interface ChapterResponse {
	id: number;
	subject?: {
		id: number;
		module?: {
			id: number;
		};
	};
}

export function useQuestionAncestors() {
	const authFetch = useApiFetch();
	const [loadingAncestors, setLoadingAncestors] = useState(false);

	const fetchMaterialAncestors = useCallback(
		async (lessonId: number | null, chapterId: number | null): Promise<QuestionAncestors | null> => {
			if (!lessonId && !chapterId) return null;

			try {
				setLoadingAncestors(true);
				if (lessonId) {
					const data = await authFetch<LessonResponse>(`/materials/lessons/${lessonId}`);
					return {
						moduleId: data.chapter?.subject?.module?.id ? String(data.chapter.subject.module.id) : '',
						subjectId: data.chapter?.subject?.id ? String(data.chapter.subject.id) : '',
						chapterId: data.chapter?.id ? String(data.chapter.id) : '',
					};
				} else if (chapterId) {
					const data = await authFetch<ChapterResponse>(`/materials/chapters/${chapterId}`);
					return {
						moduleId: data.subject?.module?.id ? String(data.subject.module.id) : '',
						subjectId: data.subject?.id ? String(data.subject.id) : '',
						chapterId: data.id ? String(data.id) : '',
					};
				}
			} catch (error) {
				console.error('Failed to fetch material ancestors:', error);
			} finally {
				setLoadingAncestors(false);
			}
			return null;
		},
		[authFetch]
	);

	return {
		loadingAncestors,
		fetchMaterialAncestors,
	};
}
