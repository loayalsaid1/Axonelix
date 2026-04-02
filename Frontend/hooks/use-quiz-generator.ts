'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { countQuestions, generateQuiz } from '@/lib/api/quizzes';
import type { ModuleHierarchy } from '@/lib/types/materials';
import type {
  QuestionType,
  QuestionStatus,
  CountQuestionsDto,
  GenerateQuizDto,
} from '@/lib/types/quizzes';

// ─── State shape ─────────────────────────────────────────────────────────────

/**
 * Selection is tracked at four levels: module → subject → chapter → lesson.
 * "checkedModules" means ALL subjects below are selected.
 * "checkedSubjects" means ALL chapters below are selected (parent module is NOT
 *   in checkedModules).
 * "checkedChapters" means ALL lessons below are selected (parent subject NOT in
 *   checkedSubjects/checkedModules).
 * "checkedLessons" are individually selected lessons whose parent chapter is NOT
 *   in checkedChapters/checkedSubjects/checkedModules.
 *
 * buildScopeFilter normalises to the finest level that has any selection,
 * expanding coarser selections downward so always one filter param type is sent.
 */
export interface GeneratorState {
  checkedModules: ReadonlySet<number>;
  checkedSubjects: ReadonlySet<number>;
  checkedChapters: ReadonlySet<number>;
  checkedLessons: ReadonlySet<number>;

  /** Expansion state for the tree */
  expandedModules: ReadonlySet<number>;
  expandedSubjects: ReadonlySet<number>;
  expandedChapters: ReadonlySet<number>;

  /** Question config */
  questionType: QuestionType | null;
  questionStatus: QuestionStatus;
  questionCount: number;
  title: string;

  /** Live count from the API */
  availableCount: number | null;
  isCountLoading: boolean;

  /** Submit state */
  isGenerating: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type GeneratorAction =
  | { type: 'TOGGLE_MODULE'; moduleId: number; allSubjectIds: number[] }
  | { type: 'TOGGLE_SUBJECT'; subjectId: number; moduleId: number; allSiblingSubjectIds: number[] }
  | { type: 'TOGGLE_CHAPTER'; chapterId: number; subjectId: number; moduleId: number; allSiblingChapterIds: number[] }
  | { type: 'TOGGLE_LESSON'; lessonId: number; chapterId: number; subjectId: number; moduleId: number; allSiblingLessonIds: number[] }
  | { type: 'TOGGLE_MODULE_EXPAND'; moduleId: number }
  | { type: 'TOGGLE_SUBJECT_EXPAND'; subjectId: number }
  | { type: 'TOGGLE_CHAPTER_EXPAND'; chapterId: number }
  | { type: 'SELECT_ALL'; allSubjectIds: number[] }
  | { type: 'CLEAR_ALL' }
  | { type: 'SET_QUESTION_TYPE'; value: QuestionType | null }
  | { type: 'SET_QUESTION_STATUS'; value: QuestionStatus }
  | { type: 'SET_QUESTION_COUNT'; value: number }
  | { type: 'SET_TITLE'; value: string }
  | { type: 'SET_AVAILABLE_COUNT'; count: number | null }
  | { type: 'SET_COUNT_LOADING'; loading: boolean }
  | { type: 'SET_GENERATING'; loading: boolean };

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: GeneratorState = {
  checkedModules: new Set(),
  checkedSubjects: new Set(),
  checkedChapters: new Set(),
  checkedLessons: new Set(),
  expandedModules: new Set(),
  expandedSubjects: new Set(),
  expandedChapters: new Set(),
  questionType: null,
  questionStatus: 'all',
  questionCount: 25,
  title: '',
  availableCount: null,
  isCountLoading: false,
  isGenerating: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function cloneSet<T>(s: ReadonlySet<T>): Set<T> {
  return new Set(s);
}

function reducer(state: GeneratorState, action: GeneratorAction): GeneratorState {
  switch (action.type) {
    case 'TOGGLE_MODULE': {
      const { moduleId, allSubjectIds } = action;
      const newMods = cloneSet(state.checkedModules);
      const newSubs = cloneSet(state.checkedSubjects);

      if (newMods.has(moduleId)) {
        newMods.delete(moduleId);
      } else {
        newMods.add(moduleId);
        allSubjectIds.forEach((id) => newSubs.delete(id));
      }
      return { ...state, checkedModules: newMods, checkedSubjects: newSubs };
    }

    case 'TOGGLE_SUBJECT': {
      const { subjectId, moduleId, allSiblingSubjectIds } = action;
      const newMods = cloneSet(state.checkedModules);
      const newSubs = cloneSet(state.checkedSubjects);

      if (newMods.has(moduleId)) {
        // Break out of module: add all siblings except this one
        newMods.delete(moduleId);
        allSiblingSubjectIds.filter((id) => id !== subjectId).forEach((id) => newSubs.add(id));
      } else if (newSubs.has(subjectId)) {
        newSubs.delete(subjectId);
      } else {
        newSubs.add(subjectId);
        // Promote to module if all siblings now selected
        const allSelected = allSiblingSubjectIds.every((id) => id === subjectId || newSubs.has(id));
        if (allSelected) {
          allSiblingSubjectIds.forEach((id) => newSubs.delete(id));
          newMods.add(moduleId);
        }
      }
      return { ...state, checkedModules: newMods, checkedSubjects: newSubs };
    }

    case 'TOGGLE_CHAPTER': {
      const { chapterId, subjectId, moduleId, allSiblingChapterIds } = action;
      const newMods = cloneSet(state.checkedModules);
      const newSubs = cloneSet(state.checkedSubjects);
      const newChaps = cloneSet(state.checkedChapters);

      const parentSelected = newMods.has(moduleId) || newSubs.has(subjectId);

      if (parentSelected) {
        // Break out of subject/module: select all sibling chapters except this one
        newMods.delete(moduleId);
        newSubs.delete(subjectId);
        allSiblingChapterIds.filter((id) => id !== chapterId).forEach((id) => newChaps.add(id));
      } else if (newChaps.has(chapterId)) {
        newChaps.delete(chapterId);
      } else {
        newChaps.add(chapterId);
        // Promote to subject if all siblings now selected
        const allSelected = allSiblingChapterIds.every((id) => id === chapterId || newChaps.has(id));
        if (allSelected) {
          allSiblingChapterIds.forEach((id) => newChaps.delete(id));
          newSubs.add(subjectId);
          // Further promote to module if all subjects selected — delegate to existing TOGGLE_SUBJECT logic isn't possible here,
          // so we do a simple check inline (no sibling subjects info available; leave module-promotion to subject toggle).
        }
      }
      return { ...state, checkedModules: newMods, checkedSubjects: newSubs, checkedChapters: newChaps };
    }

    case 'TOGGLE_LESSON': {
      const { lessonId, chapterId, subjectId, moduleId, allSiblingLessonIds } = action;
      const newMods = cloneSet(state.checkedModules);
      const newSubs = cloneSet(state.checkedSubjects);
      const newChaps = cloneSet(state.checkedChapters);
      const newLessons = cloneSet(state.checkedLessons);

      const parentSelected = newMods.has(moduleId) || newSubs.has(subjectId) || newChaps.has(chapterId);

      if (parentSelected) {
        // Break out: add all sibling lessons except this one
        newMods.delete(moduleId);
        newSubs.delete(subjectId);
        newChaps.delete(chapterId);
        allSiblingLessonIds.filter((id) => id !== lessonId).forEach((id) => newLessons.add(id));
      } else if (newLessons.has(lessonId)) {
        newLessons.delete(lessonId);
      } else {
        newLessons.add(lessonId);
        // Promote to chapter if all siblings now selected
        const allSelected = allSiblingLessonIds.every((id) => id === lessonId || newLessons.has(id));
        if (allSelected) {
          allSiblingLessonIds.forEach((id) => newLessons.delete(id));
          newChaps.add(chapterId);
        }
      }
      return { ...state, checkedModules: newMods, checkedSubjects: newSubs, checkedChapters: newChaps, checkedLessons: newLessons };
    }

    case 'TOGGLE_MODULE_EXPAND': {
      const s = cloneSet(state.expandedModules);
      s.has(action.moduleId) ? s.delete(action.moduleId) : s.add(action.moduleId);
      return { ...state, expandedModules: s };
    }

    case 'TOGGLE_SUBJECT_EXPAND': {
      const s = cloneSet(state.expandedSubjects);
      s.has(action.subjectId) ? s.delete(action.subjectId) : s.add(action.subjectId);
      return { ...state, expandedSubjects: s };
    }

    case 'TOGGLE_CHAPTER_EXPAND': {
      const s = cloneSet(state.expandedChapters);
      s.has(action.chapterId) ? s.delete(action.chapterId) : s.add(action.chapterId);
      return { ...state, expandedChapters: s };
    }

    case 'SELECT_ALL': {
      return {
        ...state,
        checkedModules: new Set(),
        checkedSubjects: new Set(action.allSubjectIds),
        checkedChapters: new Set(),
        checkedLessons: new Set(),
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        checkedModules: new Set(),
        checkedSubjects: new Set(),
        checkedChapters: new Set(),
        checkedLessons: new Set(),
      };
    }

    case 'SET_QUESTION_TYPE':
      return { ...state, questionType: action.value };

    case 'SET_QUESTION_STATUS':
      return { ...state, questionStatus: action.value };

    case 'SET_QUESTION_COUNT':
      return { ...state, questionCount: action.value };

    case 'SET_TITLE':
      return { ...state, title: action.value };

    case 'SET_AVAILABLE_COUNT':
      return { ...state, availableCount: action.count };

    case 'SET_COUNT_LOADING':
      return { ...state, isCountLoading: action.loading };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.loading };

    default:
      return state;
  }
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

export type NodeCheckState = 'checked' | 'indeterminate' | 'unchecked';

export function getModuleCheckState(
  moduleId: number,
  allSubjectIds: number[],
  state: GeneratorState,
  hierarchy?: ModuleHierarchy[],
): NodeCheckState {
  if (state.checkedModules.has(moduleId)) return 'checked';

  // If hierarchy provided, compute based on lesson-level expansion so
  // partial selections in chapters/lessons are reflected at module level.
  if (hierarchy) {
    const mod = hierarchy.find((m) => m.id === moduleId);
    if (mod) {
      let totalLessons = 0;
      let selectedLessons = 0;

      for (const subj of mod.subjects) {
        for (const chap of subj.chapters) {
          totalLessons += chap.lessons.length;

          if (state.checkedSubjects.has(subj.id) || state.checkedModules.has(moduleId)) {
            selectedLessons += chap.lessons.length;
          } else if (state.checkedChapters.has(chap.id)) {
            selectedLessons += chap.lessons.length;
          } else {
            for (const l of chap.lessons) {
              if (state.checkedLessons.has(l.id)) selectedLessons += 1;
            }
          }
        }
      }

      if (totalLessons > 0) {
        if (selectedLessons === 0) return 'unchecked';
        if (selectedLessons === totalLessons) return 'checked';
        return 'indeterminate';
      }
      // fall through to subject-level fallback if no lessons
    }
  }

  // Fallback: subject-level awareness only
  const selectedSubs = allSubjectIds.filter((id) => state.checkedSubjects.has(id));
  if (selectedSubs.length === allSubjectIds.length && allSubjectIds.length > 0) return 'checked';
  if (selectedSubs.length > 0) return 'indeterminate';
  return 'unchecked';
}

export function getSubjectCheckState(
  subjectId: number,
  moduleId: number,
  state: GeneratorState,
  hierarchy?: ModuleHierarchy[],
): NodeCheckState {
  if (state.checkedModules.has(moduleId) || state.checkedSubjects.has(subjectId)) return 'checked';

  // If hierarchy provided, derive from chapter/lesson selections under this subject
  if (hierarchy) {
    const mod = hierarchy.find((m) => m.id === moduleId);
    const subj = mod?.subjects.find((s) => s.id === subjectId);
    if (subj) {
      let totalLessons = 0;
      let selectedLessons = 0;

      for (const chap of subj.chapters) {
        totalLessons += chap.lessons.length;

        if (state.checkedChapters.has(chap.id) || state.checkedSubjects.has(subjectId) || state.checkedModules.has(moduleId)) {
          selectedLessons += chap.lessons.length;
        } else {
          for (const l of chap.lessons) {
            if (state.checkedLessons.has(l.id)) selectedLessons += 1;
          }
        }
      }

      if (totalLessons > 0) {
        if (selectedLessons === 0) return 'unchecked';
        if (selectedLessons === totalLessons) return 'checked';
        return 'indeterminate';
      }
      // fallback to chapter-level counts if no lessons
      const totalChaps = subj.chapters.length;
      const selectedChaps = subj.chapters.filter((c) => state.checkedChapters.has(c.id)).length;
      if (selectedChaps === totalChaps && totalChaps > 0) return 'checked';
      if (selectedChaps > 0) return 'indeterminate';
    }
  }

  return 'unchecked';
}

export function getChapterCheckState(
  chapterId: number,
  subjectId: number,
  moduleId: number,
  allLessonIds: number[],
  state: GeneratorState,
): NodeCheckState {
  if (
    state.checkedModules.has(moduleId) ||
    state.checkedSubjects.has(subjectId) ||
    state.checkedChapters.has(chapterId)
  )
    return 'checked';
  const selectedLessons = allLessonIds.filter((id) => state.checkedLessons.has(id));
  if (selectedLessons.length === allLessonIds.length && allLessonIds.length > 0) return 'checked';
  if (selectedLessons.length > 0) return 'indeterminate';
  return 'unchecked';
}

export function getLessonCheckState(
  lessonId: number,
  chapterId: number,
  subjectId: number,
  moduleId: number,
  state: GeneratorState,
): NodeCheckState {
  if (
    state.checkedModules.has(moduleId) ||
    state.checkedSubjects.has(subjectId) ||
    state.checkedChapters.has(chapterId) ||
    state.checkedLessons.has(lessonId)
  )
    return 'checked';
  return 'unchecked';
}

/**
 * Builds the scope filter for the API from the current selection state.
 *
 * Normalises to the FINEST level that has any selection, expanding coarser
 * selections downward so that only ONE filter param type is ever sent.
 * This avoids the backend's AND-across-levels issue.
 *
 * Levels (finest wins):  lessonIds > chapterIds > subjectIds
 */
export function buildScopeFilter(
  state: GeneratorState,
  hierarchy: ModuleHierarchy[],
): { subjectIds?: number[]; chapterIds?: number[]; lessonIds?: number[] } {
  const hasLessons = state.checkedLessons.size > 0;
  const hasChapters = state.checkedChapters.size > 0;
  const hasSubjectsOrModules = state.checkedSubjects.size > 0 || state.checkedModules.size > 0;

  if (!hasLessons && !hasChapters && !hasSubjectsOrModules) return {};

  // ── Lesson level: expand everything down to lesson IDs ───────────────────
  if (hasLessons) {
    const lessonIds = new Set<number>(state.checkedLessons);
    for (const mod of hierarchy) {
      for (const subj of mod.subjects) {
        const subjectSelected =
          state.checkedModules.has(mod.id) || state.checkedSubjects.has(subj.id);
        for (const chap of subj.chapters) {
          const chapterSelected = subjectSelected || state.checkedChapters.has(chap.id);
          if (chapterSelected) chap.lessons.forEach((l) => lessonIds.add(l.id));
        }
      }
    }
    return lessonIds.size ? { lessonIds: Array.from(lessonIds) } : {};
  }

  // ── Chapter level: expand subjects/modules down to chapter IDs ──────────
  if (hasChapters) {
    const chapterIds = new Set<number>(state.checkedChapters);
    for (const mod of hierarchy) {
      for (const subj of mod.subjects) {
        if (state.checkedModules.has(mod.id) || state.checkedSubjects.has(subj.id)) {
          subj.chapters.forEach((c) => chapterIds.add(c.id));
        }
      }
    }
    return chapterIds.size ? { chapterIds: Array.from(chapterIds) } : {};
  }

  // ── Subject level (original behaviour) ───────────────────────────────────
  const subjectIds = new Set<number>(state.checkedSubjects);
  for (const mod of hierarchy) {
    if (state.checkedModules.has(mod.id)) mod.subjects.forEach((s) => subjectIds.add(s.id));
  }
  return subjectIds.size ? { subjectIds: Array.from(subjectIds) } : {};
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQuizGenerator(hierarchy: ModuleHierarchy[]) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const { getToken } = useAuth();
  const router = useRouter();

  // ── Live question count (debounced) ────────────────────────────────────────
  const countDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countDebounceRef.current) clearTimeout(countDebounceRef.current);

    countDebounceRef.current = setTimeout(async () => {
      dispatch({ type: 'SET_COUNT_LOADING', loading: true });
      try {
        const token = await getToken();
        if (!token) return;

        const scope = buildScopeFilter(state, hierarchy);
        const dto: CountQuestionsDto = {
          ...scope,
          ...(state.questionType ? { questionType: state.questionType } : {}),
          ...(state.questionStatus !== 'all'
            ? { questionStatus: state.questionStatus }
            : {}),
        };

        const { count } = await countQuestions(dto, token);
        dispatch({ type: 'SET_AVAILABLE_COUNT', count });
      } catch {
        dispatch({ type: 'SET_AVAILABLE_COUNT', count: null });
      } finally {
        dispatch({ type: 'SET_COUNT_LOADING', loading: false });
      }
    }, 500);

    return () => {
      if (countDebounceRef.current) clearTimeout(countDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.checkedModules,
    state.checkedSubjects,
    state.checkedChapters,
    state.checkedLessons,
    state.questionType,
    state.questionStatus,
  ]);

  // ── Generate test ──────────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    dispatch({ type: 'SET_GENERATING', loading: true });
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const scope = buildScopeFilter(state, hierarchy);
      const dto: GenerateQuizDto = {
        questionCount: Number(state.questionCount),
        ...(state.title.trim() ? { title: state.title.trim() } : {}),
        ...scope,
        ...(state.questionType ? { questionType: state.questionType } : {}),
        ...(state.questionStatus !== 'all'
          ? { questionStatus: state.questionStatus }
          : {}),
      };

      const { session } = await generateQuiz(dto, token);
      router.push(`/qbank/session/${session.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate quiz');
      dispatch({ type: 'SET_GENERATING', loading: false });
    }
  }, [state, hierarchy, getToken, router]);

  // ── Convenience helpers for the tree ──────────────────────────────────────
  const toggleModule = useCallback(
    (moduleId: number) => {
      const mod = hierarchy.find((m) => m.id === moduleId);
      const allSubjectIds = mod?.subjects.map((s) => s.id) ?? [];
      dispatch({ type: 'TOGGLE_MODULE', moduleId, allSubjectIds });
    },
    [hierarchy],
  );

  const toggleSubject = useCallback(
    (subjectId: number, moduleId: number) => {
      const mod = hierarchy.find((m) => m.id === moduleId);
      const allSiblingSubjectIds = mod?.subjects.map((s) => s.id) ?? [];
      dispatch({ type: 'TOGGLE_SUBJECT', subjectId, moduleId, allSiblingSubjectIds });
    },
    [hierarchy],
  );

  const toggleChapter = useCallback(
    (chapterId: number) => {
      // Find parent context from hierarchy
      for (const mod of hierarchy) {
        for (const subj of mod.subjects) {
          const allSiblingChapterIds = subj.chapters.map((c) => c.id);
          if (allSiblingChapterIds.includes(chapterId)) {
            dispatch({
              type: 'TOGGLE_CHAPTER',
              chapterId,
              subjectId: subj.id,
              moduleId: mod.id,
              allSiblingChapterIds,
            });
            return;
          }
        }
      }
    },
    [hierarchy],
  );

  const toggleLesson = useCallback(
    (lessonId: number, chapterId: number, subjectId: number, moduleId: number) => {
      // Find sibling lessons from hierarchy
      let allSiblingLessonIds: number[] = [];
      for (const mod of hierarchy) {
        if (mod.id !== moduleId) continue;
        for (const subj of mod.subjects) {
          if (subj.id !== subjectId) continue;
          for (const chap of subj.chapters) {
            if (chap.id === chapterId) {
              allSiblingLessonIds = chap.lessons.map((l) => l.id);
              break;
            }
          }
        }
      }
      dispatch({ type: 'TOGGLE_LESSON', lessonId, chapterId, subjectId, moduleId, allSiblingLessonIds });
    },
    [hierarchy],
  );

  const toggleModuleExpand = useCallback((moduleId: number) => {
    dispatch({ type: 'TOGGLE_MODULE_EXPAND', moduleId });
  }, []);

  const toggleSubjectExpand = useCallback((subjectId: number) => {
    dispatch({ type: 'TOGGLE_SUBJECT_EXPAND', subjectId });
  }, []);

  const toggleChapterExpand = useCallback((chapterId: number) => {
    dispatch({ type: 'TOGGLE_CHAPTER_EXPAND', chapterId });
  }, []);

  const selectAll = useCallback(() => {
    const allSubjectIds = hierarchy
      .filter((m) => m.accessStatus !== 'locked')
      .flatMap((m) => m.subjects.map((s) => s.id));
    dispatch({ type: 'SELECT_ALL', allSubjectIds });
  }, [hierarchy]);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Count of "selected items" shown in the sidebar badge.
  // Shows whichever level is finest: lessons > chapters > subjects.
  const totalSelected = (() => {
    if (state.checkedLessons.size > 0) {
      // Count all effectively-selected lessons (expand parents)
      let n = state.checkedLessons.size;
      for (const mod of hierarchy) {
        for (const subj of mod.subjects) {
          const subjectSelected =
            state.checkedModules.has(mod.id) || state.checkedSubjects.has(subj.id);
          for (const chap of subj.chapters) {
            if (subjectSelected || state.checkedChapters.has(chap.id)) n += chap.lessons.length;
          }
        }
      }
      return n;
    }
    if (state.checkedChapters.size > 0) {
      let n = state.checkedChapters.size;
      for (const mod of hierarchy) {
        for (const subj of mod.subjects) {
          if (state.checkedModules.has(mod.id) || state.checkedSubjects.has(subj.id))
            n += subj.chapters.length;
        }
      }
      return n;
    }
    // Subject/module level
    return (
      state.checkedSubjects.size +
      hierarchy
        .filter((m) => state.checkedModules.has(m.id))
        .reduce((acc, m) => acc + m.subjects.length, 0)
    );
  })();

  return {
    state,
    dispatch,
    totalSelected,
    // actions
    toggleModule,
    toggleSubject,
    toggleChapter,
    toggleLesson,
    toggleModuleExpand,
    toggleSubjectExpand,
    toggleChapterExpand,
    selectAll,
    clearAll,
    generate,
    // check-state helpers
    getModuleCheckState: (moduleId: number, allSubjectIds: number[]) =>
      getModuleCheckState(moduleId, allSubjectIds, state, hierarchy),
    getSubjectCheckState: (subjectId: number, moduleId: number) =>
      getSubjectCheckState(subjectId, moduleId, state, hierarchy),
    getChapterCheckState: (
      chapterId: number,
      subjectId: number,
      moduleId: number,
      allLessonIds: number[],
    ) => getChapterCheckState(chapterId, subjectId, moduleId, allLessonIds, state),
    getLessonCheckState: (
      lessonId: number,
      chapterId: number,
      subjectId: number,
      moduleId: number,
    ) => getLessonCheckState(lessonId, chapterId, subjectId, moduleId, state),
  };
}
