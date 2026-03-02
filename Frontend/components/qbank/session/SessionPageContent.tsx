'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { getSession, updateSessionStatus } from '@/lib/api/quizzes';
import { SessionOverview } from './SessionOverview';
import { TestInterface } from './TestInterface';
import { SessionResults } from './SessionResults';
import { SessionReview } from './SessionReview';
import { Skeleton } from '@/components/ui/skeleton';
import type { SessionDetail } from '@/lib/types/quizzes';

interface SessionPageContentProps {
  /**
   * Initial session data fetched server-side.
   * When the server re-renders (after router.refresh()), this prop updates
   * and we sync local state via useEffect.
   */
  initialData: SessionDetail;
}

/**
 * Client component that owns the mutable session view.
 *
 * Renders one of three views depending on session.status:
 *   not_started | suspended → SessionOverview (start/resume button)
 *   in_progress             → TestInterface   (active test)
 *   completed               → SessionResults  (read-only results)
 */
export function SessionPageContent({ initialData }: SessionPageContentProps) {
  const [sessionDetail, setSessionDetail] = useState<SessionDetail>(initialData);
  const [isStarting, setIsStarting] = useState(false);
  const [activeView, setActiveView] = useState<'results' | 'review'>('results');
  const { getToken } = useAuth();

  // Sync when server provides fresh data (triggered by router.refresh())
  useEffect(() => {
    setSessionDetail(initialData);
  }, [initialData]);

  const handleStart = useCallback(async () => {
    setIsStarting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      // updateSessionStatus returns the full normalised SessionDetail (backend
      // runs findOne after the transition), so no second getSession fetch needed.
      const fresh = await updateSessionStatus(
        sessionDetail.session.id,
        { status: 'in_progress' },
        token,
      );
      setSessionDetail(fresh);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsStarting(false);
    }
  }, [sessionDetail.session.id, getToken]);

  /** Called by TestInterface after endSession API call succeeds — reload results */
  const handleSessionEnded = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const fresh = await getSession(sessionDetail.session.id, token);
      setSessionDetail(fresh);
    } catch {
      // silently ignore — user can refresh manually
    }
  }, [sessionDetail.session.id, getToken]);

  const { session, quiz } = sessionDetail;

  if (isStarting) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="space-y-3 w-full max-w-sm">
          <Skeleton className="mx-auto w-3/4 h-8" />
          <Skeleton className="mx-auto w-1/2 h-4" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    );
  }

  if (session.status === 'not_started' || session.status === 'suspended') {
    return (
      <SessionOverview quiz={quiz} session={session} onStart={handleStart} />
    );
  }

  if (session.status === 'completed') {
    if (activeView === 'review') {
      return (
        <SessionReview
          sessionDetail={sessionDetail}
          onBack={() => setActiveView('results')}
        />
      );
    }
    return (
      <SessionResults
        quiz={quiz}
        session={session}
        onReview={() => setActiveView('review')}
      />
    );
  }

  // in_progress — hand full session detail to the test interface
  return <TestInterface sessionDetail={sessionDetail} onSessionEnded={handleSessionEnded} />;
}
