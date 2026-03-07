/**
 * Response shape normalizers — translate NestJS camelCase responses to the
 * snake_case shapes that the existing admin frontend components were originally 
 * written against.
 *
 * Only fields actually consumed by the UI are included to keep the payloads lean.
 */

// ─── Basic entities ────────────────────────────────────────────────────────────

export function normalizeModule(m: any) {
	if (!m) return m;
	return {
		id: m.id,
		name: m.name,
		description: m.description,
		order_index: m.orderIndex ?? m.order_index ?? 0,
		created_at: m.createdAt ?? m.created_at,
		updated_at: m.updatedAt ?? m.updated_at,
	};
}

export function normalizeSubject(s: any) {
	if (!s) return s;
	return {
		id: s.id,
		name: s.name,
		description: s.description,
		type: s.type,
		module_id: s.moduleId ?? s.module_id,
		order_index: s.orderIndex ?? s.order_index ?? 0,
		created_at: s.createdAt ?? s.created_at,
		updated_at: s.updatedAt ?? s.updated_at,
	};
}

export function normalizeChapter(c: any) {
	if (!c) return c;
	return {
		id: c.id,
		name: c.name,
		description: c.description,
		subject_id: c.subjectId ?? c.subject_id,
		order_index: c.orderIndex ?? c.order_index ?? 0,
		is_miscellaneous: c.isMiscellaneous ?? c.is_miscellaneous ?? false,
		created_at: c.createdAt ?? c.created_at,
		updated_at: c.updatedAt ?? c.updated_at,
	};
}

export function normalizeLesson(l: any) {
	if (!l) return l;
	return {
		id: l.id,
		name: l.name,
		description: l.description,
		content: l.content,
		chapter_id: l.chapterId ?? l.chapter_id,
		order_index: l.orderIndex ?? l.order_index ?? 0,
		created_at: l.createdAt ?? l.created_at,
		updated_at: l.updatedAt ?? l.updated_at,
	};
}

// ─── Lesson with full hierarchy (flat structure expected by lesson edit page) ─

export function normalizeLessonWithHierarchy(l: any) {
	if (!l) return l;
	const chapter = l.chapter;
	const subject = chapter?.subject;
	const mod = subject?.module;
	return {
		id: l.id,
		name: l.name,
		description: l.description,
		content: l.content,
		chapter_id: String(l.chapterId ?? l.chapter_id ?? chapter?.id ?? ''),
		order_index: l.orderIndex ?? l.order_index ?? 0,
		created_at: l.createdAt ?? l.created_at,
		updated_at: l.updatedAt ?? l.updated_at,
		// Hierarchy context
		chapter_name: chapter?.name,
		is_miscellaneous: chapter?.isMiscellaneous ?? chapter?.is_miscellaneous ?? false,
		subject_id: subject ? String(subject.id) : undefined,
		subject_name: subject?.name,
		module_id: mod ? String(mod.id) : undefined,
		module_name: mod?.name,
	};
}

// ─── Recent lessons (flat RecentMaterial shape) ────────────────────────────────

export function normalizeRecentLesson(l: any) {
	if (!l) return l;
	const chapter = l.chapter;
	const subject = chapter?.subject;
	const mod = subject?.module;
	return {
		id: String(l.id),
		name: l.name,
		type: 'lesson' as const,
		description: l.description,
		updated_at: l.updatedAt ?? l.updated_at,
		created_at: l.createdAt ?? l.created_at,
		module_id: mod ? String(mod.id) : undefined,
		module_name: mod?.name,
		subject_id: subject ? String(subject.id) : undefined,
		subject_name: subject?.name,
		chapter_id: chapter ? String(chapter.id) : undefined,
		chapter_name: chapter?.name,
	};
}

// ─── Hierarchy / filter-options (flat lists for cascading Select dropdowns) ────
//
// IDs are serialised as strings so that shadcn <Select value> comparisons work
// correctly (Select onChange always yields a string).

export function normalizeHierarchyOptions(data: any) {
	if (!data) return data;
	return {
		modules: (data.modules ?? []).map((m: any) => ({
			id: String(m.id),
			name: m.name,
		})),
		subjects: (data.subjects ?? []).map((s: any) => ({
			id: String(s.id),
			name: s.name,
			type: s.type,
			module_id: String(s.moduleId ?? s.module_id ?? ''),
		})),
		chapters: (data.chapters ?? []).map((c: any) => ({
			id: String(c.id),
			name: c.name,
			subject_id: String(c.subjectId ?? c.subject_id ?? ''),
			is_miscellaneous: c.isMiscellaneous ?? c.is_miscellaneous ?? false,
		})),
		lessons: (data.lessons ?? []).map((l: any) => ({
			id: String(l.id),
			name: l.name,
			chapter_id: String(l.chapterId ?? l.chapter_id ?? ''),
		})),
	};
}
