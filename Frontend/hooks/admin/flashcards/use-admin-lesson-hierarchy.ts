import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type useApiFetch } from "@/hooks/use-api-fetch";
import {
	type ChapterOption,
	type ChapterResponse,
	type LessonOption,
	type LessonResponse,
	type ModuleOption,
	type SubjectOption,
	type SubjectResponse,
} from "@/lib/types/lesson-hierarchy.types";

type AuthFetch = ReturnType<typeof useApiFetch>;

interface UseAdminLessonHierarchyResult {
	modules: ModuleOption[];
	subjects: SubjectOption[];
	chapters: ChapterOption[];
	lessons: LessonOption[];
	selectedModuleId: number | null;
	selectedSubjectId: number | null;
	selectedChapterId: number | null;
	selectedLessonId: number | null;
	modulesLoading: boolean;
	subjectsLoading: boolean;
	chaptersLoading: boolean;
	lessonsLoading: boolean;
	hierarchyLoading: boolean;
	setSelectedModuleId: (moduleId: number | null) => void;
	setSelectedSubjectId: (subjectId: number | null) => void;
	setSelectedChapterId: (chapterId: number | null) => void;
	setSelectedLessonId: (lessonId: number | null) => void;
	resetSelection: () => void;
}

export function useAdminLessonHierarchy(authFetch: AuthFetch): UseAdminLessonHierarchyResult {
	const [modules, setModules] = useState<ModuleOption[]>([]);
	const [subjects, setSubjects] = useState<SubjectOption[]>([]);
	const [chapters, setChapters] = useState<ChapterOption[]>([]);
	const [lessons, setLessons] = useState<LessonOption[]>([]);

	const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
	const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
	const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
	const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

	const [modulesLoading, setModulesLoading] = useState(false);
	const [subjectsLoading, setSubjectsLoading] = useState(false);
	const [chaptersLoading, setChaptersLoading] = useState(false);
	const [lessonsLoading, setLessonsLoading] = useState(false);

	useEffect(() => {
		let active = true;
		setModulesLoading(true);

		authFetch<ModuleOption[]>("/materials/modules/names")
			.then((result) => {
				if (!active) {
					return;
				}
				setModules(result ?? []);
			})
			.catch((error) => {
				console.error("Failed to load modules:", error);
				toast.error("Failed to load modules.");
			})
			.finally(() => {
				if (active) {
					setModulesLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [authFetch]);

	useEffect(() => {
		setSelectedSubjectId(null);
		setSelectedChapterId(null);
		setSelectedLessonId(null);
		setSubjects([]);
		setChapters([]);
		setLessons([]);

		if (!selectedModuleId) {
			return;
		}

		let active = true;
		setSubjectsLoading(true);

		authFetch<SubjectResponse[]>(`/materials/subjects?moduleId=${selectedModuleId}`)
			.then((result) => {
				if (!active) {
					return;
				}

				setSubjects(
					(result ?? []).map((subject) => ({
						id: subject.id,
						name: subject.name,
						type: subject.type,
					})),
				);
			})
			.catch((error) => {
				console.error("Failed to load subjects:", error);
				toast.error("Failed to load subjects.");
			})
			.finally(() => {
				if (active) {
					setSubjectsLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [authFetch, selectedModuleId]);

	useEffect(() => {
		setSelectedChapterId(null);
		setSelectedLessonId(null);
		setChapters([]);
		setLessons([]);

		if (!selectedSubjectId) {
			return;
		}

		let active = true;
		setChaptersLoading(true);

		authFetch<ChapterResponse[]>(`/materials/subjects/${selectedSubjectId}/chapters`)
			.then((result) => {
				if (!active) {
					return;
				}

				setChapters(
					(result ?? []).map((chapter) => ({
						id: chapter.id,
						name: chapter.name,
					})),
				);
			})
			.catch((error) => {
				console.error("Failed to load chapters:", error);
				toast.error("Failed to load chapters.");
			})
			.finally(() => {
				if (active) {
					setChaptersLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [authFetch, selectedSubjectId]);

	useEffect(() => {
		setSelectedLessonId(null);
		setLessons([]);

		if (!selectedChapterId) {
			return;
		}

		let active = true;
		setLessonsLoading(true);

		authFetch<LessonResponse[]>(`/materials/chapters/${selectedChapterId}/lessons`)
			.then((result) => {
				if (!active) {
					return;
				}

				setLessons(
					(result ?? []).map((lesson) => ({
						id: lesson.id,
						name: lesson.name,
					})),
				);
			})
			.catch((error) => {
				console.error("Failed to load lessons:", error);
				toast.error("Failed to load lessons.");
			})
			.finally(() => {
				if (active) {
					setLessonsLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [authFetch, selectedChapterId]);

	function resetSelection() {
		setSelectedModuleId(null);
		setSelectedSubjectId(null);
		setSelectedChapterId(null);
		setSelectedLessonId(null);
		setSubjects([]);
		setChapters([]);
		setLessons([]);
	}

	return {
		modules,
		subjects,
		chapters,
		lessons,
		selectedModuleId,
		selectedSubjectId,
		selectedChapterId,
		selectedLessonId,
		modulesLoading,
		subjectsLoading,
		chaptersLoading,
		lessonsLoading,
		hierarchyLoading: modulesLoading || subjectsLoading || chaptersLoading || lessonsLoading,
		setSelectedModuleId,
		setSelectedSubjectId,
		setSelectedChapterId,
		setSelectedLessonId,
		resetSelection,
	};
}
