import { useState, useEffect, useMemo } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface Module {
	id: string;
	name: string;
}

export interface Subject {
	id: string;
	name: string;
	type: string;
	chapters?: Chapter[];
}

export interface Chapter {
	id: string;
	name: string;
	lessons?: Lesson[];
}

export interface Lesson {
	id: string;
	name: string;
}

export interface ModuleHierarchy {
	id: number;
	name: string;
	level: number;
	description: string | null;
	orderIndex: number;
	createdAt: string;
	updatedAt: string;
	subjects: {
		id: number;
		name: string;
		type: string;
		orderIndex: number;
		createdAt: string;
		updatedAt: string;
		chapters: {
			id: number;
			name: string;
			orderIndex: number;
			createdAt: string;
			updatedAt: string;
			lessons: {
				id: number;
				name: string;
				orderIndex: number;
				createdAt: string;
				updatedAt: string;
			}[];
		}[];
	}[];
}

export function useMaterialHierarchy() {
	const authFetch = useApiFetch();
	const [selectedModule, setSelectedModule] = useState('');
	const [selectedSubject, setSelectedSubject] = useState('');
	const [selectedChapter, setSelectedChapter] = useState('');

	const [modules, setModules] = useState<Module[]>([]);
	const [hierarchy, setHierarchy] = useState<ModuleHierarchy | null>(null);

	// Fetch module names only once
	useEffect(() => {
		authFetch<{ id: number; name: string }[]>('/materials/modules/names')
			.then((data) => setModules(data.map((m) => ({ id: String(m.id), name: m.name }))))
			.catch((error) => console.error('Failed to fetch modules:', error));
	}, [authFetch]);

	// Fetch full hierarchy when a module is selected
	useEffect(() => {
		if (selectedModule) {
			authFetch<ModuleHierarchy>(`/materials/modules/${selectedModule}/hierarchy`)
				.then((data) => setHierarchy(data))
				.catch((error) => console.error('Failed to fetch module hierarchy:', error));
		} else {
			setHierarchy(null);
		}
	}, [selectedModule, authFetch]);

	// Derive subjects, chapters, and lessons from the full hierarchy tree
	const subjects = useMemo(() => {
		if (!hierarchy || !hierarchy.subjects) return [];
		return hierarchy.subjects.map((s) => ({
			id: String(s.id),
			name: s.name,
			type: s.type,
		}));
	}, [hierarchy]);

	const chapters = useMemo(() => {
		if (!hierarchy || !hierarchy.subjects || !selectedSubject) return [];
		const subject = hierarchy.subjects.find((s) => String(s.id) === selectedSubject);
		if (!subject || !subject.chapters) return [];
		return subject.chapters.map((c) => ({
			id: String(c.id),
			name: c.name,
		}));
	}, [hierarchy, selectedSubject]);

	const lessons = useMemo(() => {
		if (!hierarchy || !hierarchy.subjects || !selectedSubject || !selectedChapter) return [];
		const subject = hierarchy.subjects.find((s) => String(s.id) === selectedSubject);
		if (!subject || !subject.chapters) return [];
		const chapter = subject.chapters.find((c) => String(c.id) === selectedChapter);
		if (!chapter || !chapter.lessons) return [];
		return chapter.lessons.map((l) => ({
			id: String(l.id),
			name: l.name,
		}));
	}, [hierarchy, selectedSubject, selectedChapter]);

	// Expose a way to reset downstream states when the form is submitted/reset
	const resetHierarchy = () => {
		setSelectedModule('');
		setSelectedSubject('');
		setSelectedChapter('');
	};

	return {
		modules,
		selectedModule,
		setSelectedModule,
		selectedSubject,
		setSelectedSubject,
		selectedChapter,
		setSelectedChapter,
		subjects,
		chapters,
		lessons,
		resetHierarchy,
	};
}
