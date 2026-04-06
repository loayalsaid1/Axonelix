export interface LessonDetailsResponse {
	id: number;
	name: string;
	description: string | null;
	chapter: {
		id: number;
		name: string;
		subject: {
			id: number;
			name: string;
			type: string;
			module: {
				id: number;
				name: string;
			};
		};
	};
}

export interface SelectedLessonPath {
	module: {
		id: number;
		name: string;
	};
	subject: {
		id: number;
		name: string;
		type: string;
	};
	chapter: {
		id: number;
		name: string;
	};
	lesson: {
		id: number;
		name: string;
	};
}

export type PendingHierarchyAction =
	| { kind: "module"; moduleId: number | null }
	| { kind: "subject"; subjectId: number | null }
	| { kind: "chapter"; chapterId: number | null }
	| { kind: "lesson"; lessonId: number | null }
	| { kind: "reset" };
