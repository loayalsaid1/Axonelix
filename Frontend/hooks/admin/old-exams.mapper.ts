import type { SubjectType, ExamType } from '@/lib/types/old-exams';
import type { OldExam } from './use-old-exams';

export interface OldExamRecord {
	id: string | number;
	examType: ExamType;
	year: number;
	universityId: string | number;
	moduleId: string | number;
	moduleType: SubjectType;
	createdAt: string;
	module?: { id: string | number; name: string };
	university?: { id: string | number; name: string };
}

export function mapOldExamRecordToAdminOldExam(record: OldExamRecord): OldExam {
	return {
		...record,
		id: String(record.id),
		universityId: String(record.universityId),
		moduleId: String(record.moduleId),
		module: record.module
			? { id: String(record.module.id), name: record.module.name }
			: undefined,
		university: record.university
			? { id: String(record.university.id), name: record.university.name }
			: undefined,
	};
}
