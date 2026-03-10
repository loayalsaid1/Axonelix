import { useState, useEffect } from 'react';
import { useApiFetch } from '@/hooks/use-api-fetch';

export interface Subject {
	id: string;
	name: string;
	type: string;
}

export interface Chapter {
	id: string;
	name: string;
}

export interface Lesson {
	id: string;
	name: string;
}

export function useMaterialHierarchy() {
	const authFetch = useApiFetch();
	const [selectedModule, setSelectedModule] = useState('');
	const [selectedSubject, setSelectedSubject] = useState('');
	const [selectedChapter, setSelectedChapter] = useState('');

	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [lessons, setLessons] = useState<Lesson[]>([]);

	useEffect(() => {
		if (selectedModule) {
			authFetch<any[]>(`/materials/subjects?moduleId=${selectedModule}`)
				.then((data) =>
					setSubjects(data.map((s) => ({ id: String(s.id), name: s.name, type: s.type })))
				)
				.catch((error) => console.error('Failed to fetch subjects:', error));
		} else {
			setSubjects([]);
		}
		setSelectedSubject('');
		setSelectedChapter('');
	}, [selectedModule, authFetch]);

	useEffect(() => {
		if (selectedSubject) {
			authFetch<any[]>(`/materials/subjects/${selectedSubject}/chapters`)
				.then((data) =>
					setChapters(data.map((c) => ({ id: String(c.id), name: c.name })))
				)
				.catch((error) => console.error('Failed to fetch chapters:', error));
		} else {
			setChapters([]);
		}
		setSelectedChapter('');
	}, [selectedSubject, authFetch]);

	useEffect(() => {
		if (selectedChapter) {
			authFetch<any[]>(`/materials/chapters/${selectedChapter}/lessons`)
				.then((data) =>
					setLessons(data.map((l) => ({ id: String(l.id), name: l.name })))
				)
				.catch((error) => console.error('Failed to fetch lessons:', error));
		} else {
			setLessons([]);
		}
	}, [selectedChapter, authFetch]);

	// Expose a way to reset downstream states when the form is submitted/reset
	const resetHierarchy = () => {
		setSelectedModule('');
		setSelectedSubject('');
		setSelectedChapter('');
	};

	return {
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
