'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateSessionStatus } from '@/lib/api/quizzes';
import type {
  SessionDetail,
  SessionAnswer,
  SessionMetadata,
  AnswerDto,
  QuizQuestion,
} from '@/lib/types/quizzes';

// ─── Local answer shape ───────────────────────────────────────────────────────

export interface LocalAnswer {
  questionId: number;
  selectedOptionId?: number;
  writtenAnswer?: string;
  isMarked: boolean;
  /** Set<optionId> of options struck-through by the user */
  eliminatedOptions: Set<number>;
  isSubmitted?: boolean;
}

// ─── State shape ─────────────────────────────────────────────────────────────

export interface TestSessionState {
  /** Local answer map — never persisted until suspend/complete */
  answers: Record<number, LocalAnswer>;
  /** Index into the questions array (0-based) */
  currentIndex: number;
  /** IDs of questions the user has visited */
  seen: Set<number>;
  /** Elapsed time in seconds (incremented by the timer) */
  elapsedSecs: number;
  /** Toggle to show correct answers and explanations for all questions */
  showAllAnswers: boolean;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type TestSessionAction =
  | { type: 'NAVIGATE'; index: number; questionId: number }
  | { type: 'SELECT_OPTION'; questionId: number; optionId: number }
  | { type: 'SET_WRITTEN'; questionId: number; text: string }
  | { type: 'TOGGLE_MARK'; questionId: number }
  | { type: 'TOGGLE_ELIMINATE'; questionId: number; optionId: number }
  | { type: 'SUBMIT_ANSWER'; questionId: number }
  | { type: 'TOGGLE_SHOW_ALL_ANSWERS' }
  | { type: 'TICK' }
  | { type: 'HYDRATE'; answers: SessionAnswer[]; metadata: SessionMetadata | null; currentIndex: number; elapsedSecs?: number };

// ─── Initial state ────────────────────────────────────────────────────────────

function makeInitialState(questions: QuizQuestion[]): TestSessionState {
  return {
    answers: {},
    currentIndex: 0,
    seen: questions.length > 0 ? new Set([questions[0].id]) : new Set(),
    elapsedSecs: 0,
    showAllAnswers: false,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: TestSessionState, action: TestSessionAction): TestSessionState {
  switch (action.type) {
    case 'NAVIGATE': {
      const newSeen = new Set(state.seen);
      newSeen.add(action.questionId);
      return { ...state, currentIndex: action.index, seen: newSeen };
    }

    case 'SELECT_OPTION': {
      const prev = state.answers[action.questionId] ?? {
        questionId: action.questionId,
        isMarked: false,
        eliminatedOptions: new Set<number>(),
      };
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: { ...prev, selectedOptionId: action.optionId },
        },
      };
    }

    case 'SET_WRITTEN': {
      const prev = state.answers[action.questionId] ?? {
        questionId: action.questionId,
        isMarked: false,
        eliminatedOptions: new Set<number>(),
      };
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: { ...prev, writtenAnswer: action.text },
        },
      };
    }

    case 'TOGGLE_MARK': {
      const prev = state.answers[action.questionId] ?? {
        questionId: action.questionId,
        isMarked: false,
        eliminatedOptions: new Set<number>(),
      };
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: { ...prev, isMarked: !prev.isMarked },
        },
      };
    }

    case 'TOGGLE_ELIMINATE': {
      const prev = state.answers[action.questionId] ?? {
        questionId: action.questionId,
        isMarked: false,
        eliminatedOptions: new Set<number>(),
      };
      const newElim = new Set(prev.eliminatedOptions);
      if (newElim.has(action.optionId)) {
        newElim.delete(action.optionId);
      } else {
        newElim.add(action.optionId);
      }
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: { ...prev, eliminatedOptions: newElim },
        },
      };
    }

    case 'SUBMIT_ANSWER': {
      const prev = state.answers[action.questionId] ?? {
        questionId: action.questionId,
        isMarked: false,
        eliminatedOptions: new Set<number>(),
      };
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: { ...prev, isSubmitted: true },
        },
      };
    }

    case 'TOGGLE_SHOW_ALL_ANSWERS':
      return { ...state, showAllAnswers: !state.showAllAnswers };

    case 'TICK':
      return { ...state, elapsedSecs: state.elapsedSecs + 1 };

    case 'HYDRATE': {
      const answers: Record<number, LocalAnswer> = {};
      for (const a of action.answers) {
        answers[a.questionId] = {
          questionId: a.questionId,
          selectedOptionId: a.selectedOptionId ?? undefined,
          writtenAnswer: a.writtenAnswer ?? undefined,
          isMarked: a.isMarked,
          eliminatedOptions: new Set(),
          isSubmitted: false,
        };
      }
      const seen = new Set<number>(action.metadata?.answered ?? []);
      (action.metadata?.unanswered ?? []).forEach((id) => seen.add(id));
      (action.metadata?.unseen ?? []).forEach((id) => seen.delete(id));

      return {
        ...state,
        answers,
        currentIndex: action.currentIndex,
        seen,
        elapsedSecs: action.elapsedSecs ?? 0,
      };
    }

    default:
      return state;
  }
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

/** Serialise local state into the AnswerDto batch for the API */
function toAnswerDtos(answers: Record<number, LocalAnswer>): AnswerDto[] {
  return Object.values(answers).map((a) => ({
    questionId: a.questionId,
    ...(a.selectedOptionId !== undefined ? { selectedOptionId: a.selectedOptionId } : {}),
    ...(a.writtenAnswer !== undefined ? { writtenAnswer: a.writtenAnswer } : {}),
    isMarked: a.isMarked,
    isEliminated: false, // option-level elimination isn't a per-answer field in DTO
  }));
}

/** Build the metadata snapshot from local state */
function toMetadata(
  state: TestSessionState,
  questions: QuizQuestion[],
): SessionMetadata {
  const questionIds = questions.map((q) => q.id);
  const answered = questionIds.filter(
    (id) => state.answers[id]?.selectedOptionId !== undefined || state.answers[id]?.writtenAnswer,
  );
  const unseen = questionIds.filter((id) => !state.seen.has(id));
  const unanswered = questionIds.filter(
    (id) => state.seen.has(id) && !answered.includes(id),
  );
  const marked = questionIds.filter((id) => state.answers[id]?.isMarked);
  const currentQ = questions[state.currentIndex];

  return {
    answered,
    unanswered,
    unseen,
    marked,
    current_question_id: currentQ?.id,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseTestSessionOptions {
  sessionDetail: SessionDetail;
  /** Called after session successfully ends — parent updates its state */
  onSessionEnded?: () => void;
}

export function useTestSession({ sessionDetail, onSessionEnded }: UseTestSessionOptions) {
  const { session, quiz, answers: persistedAnswers } = sessionDetail;
  const questions = quiz.questions;
  const { getToken } = useAuth();
  const router = useRouter();

  // Determine starting index from metadata if resuming
  const startingIndex = (() => {
    const meta = session.metadata;
    if (!meta?.current_question_id) return 0;
    const idx = questions.findIndex((q) => q.id === meta.current_question_id);
    return idx >= 0 ? idx : 0;
  })();

  const [state, dispatch] = useReducer(reducer, questions, makeInitialState);

  // Hydrate from persisted answers on mount (for resume)
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (persistedAnswers.length > 0 || session.metadata) {
      dispatch({
        type: 'HYDRATE',
        answers: persistedAnswers,
        metadata: session.metadata,
        currentIndex: startingIndex,
        elapsedSecs: session.timeTakenSecs ?? 0,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer — only ticks when session is in_progress
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    const isActive = session.status === 'in_progress';
    if (isActive) {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.status]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;
      dispatch({ type: 'NAVIGATE', index, questionId: questions[index].id });
    },
    [questions],
  );

  const goNext = useCallback(() => goTo(state.currentIndex + 1), [goTo, state.currentIndex]);
  const goPrev = useCallback(() => goTo(state.currentIndex - 1), [goTo, state.currentIndex]);

  // ── Answer interactions ────────────────────────────────────────────────────
  const selectOption = useCallback(
    (questionId: number, optionId: number) =>
      dispatch({ type: 'SELECT_OPTION', questionId, optionId }),
    [],
  );

  const setWritten = useCallback(
    (questionId: number, text: string) =>
      dispatch({ type: 'SET_WRITTEN', questionId, text }),
    [],
  );

  const toggleMark = useCallback(
    (questionId: number) => dispatch({ type: 'TOGGLE_MARK', questionId }),
    [],
  );

  const toggleEliminate = useCallback(
    (questionId: number, optionId: number) =>
      dispatch({ type: 'TOGGLE_ELIMINATE', questionId, optionId }),
    [],
  );

  const submitAnswer = useCallback(
    (questionId: number) => dispatch({ type: 'SUBMIT_ANSWER', questionId }),
    [],
  );

  const toggleShowAllAnswers = useCallback(
    () => dispatch({ type: 'TOGGLE_SHOW_ALL_ANSWERS' }),
    [],
  );

  // ── Session lifecycle ──────────────────────────────────────────────────────
  const suspendSession = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await updateSessionStatus(
        session.id,
        {
          status: 'suspended',
          answers: toAnswerDtos(state.answers),
          metadata: toMetadata(state, questions),
          timeTakenSecs: state.elapsedSecs,
        },
        token,
      );
      toast.success('Test suspended. You can resume it later.');
      router.push('/qbank/my-tests');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to suspend session');
    }
  }, [session.id, state, questions, getToken, router]);

  const endSession = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      await updateSessionStatus(
        session.id,
        {
          status: 'completed',
          answers: toAnswerDtos(state.answers),
          metadata: toMetadata(state, questions),
          timeTakenSecs: state.elapsedSecs,
        },
        token,
      );
      // Notify parent to refresh session data and show results
      onSessionEnded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to end session');
    }
  }, [session.id, state, questions, getToken, onSessionEnded]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const currentQuestion = questions[state.currentIndex] ?? null;

  const answeredIds = Object.keys(state.answers)
    .map(Number)
    .filter(
      (id) =>
        state.answers[id]?.selectedOptionId !== undefined ||
        !!state.answers[id]?.writtenAnswer,
    );

  const totalAnswered = answeredIds.length;
  const totalMarked = Object.values(state.answers).filter((a) => a.isMarked).length;

  return {
    state,
    dispatch,
    questions,
    currentQuestion,
    totalAnswered,
    totalMarked,
    // actions
    goTo,
    goNext,
    goPrev,
    selectOption,
    setWritten,
    toggleMark,
    toggleEliminate,
    submitAnswer,
    toggleShowAllAnswers,
    suspendSession,
    endSession,
  };
}
