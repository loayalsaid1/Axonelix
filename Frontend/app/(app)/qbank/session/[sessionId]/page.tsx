import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { SessionPageContent } from '@/components/qbank/session/SessionPageContent';
import { toSessionDetail } from '@/lib/types/quizzes';
import { API_BASE_URL } from '@/lib/constants';
import type { QuizSession, Quiz, SessionAnswer } from '@/lib/types/quizzes';

export const metadata: Metadata = { title: 'Test Session' };

// Raw flat response shape from GET /quiz-sessions/:id
type RawSessionDetail = QuizSession & { quiz: Quiz; answers: SessionAnswer[] };

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) redirect('/sign-in');

  const { sessionId } = await params;
  const id = parseInt(sessionId, 10);
  if (isNaN(id)) notFound();

  const res = await fetch(`${API_BASE_URL}/quiz-sessions/${id}`, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 404) notFound();
  if (!res.ok) {
    throw new Error(`Failed to load session (${res.status})`);
  }

  const raw: RawSessionDetail = await res.json();
  const sessionDetail = toSessionDetail(raw);

  return <SessionPageContent initialData={sessionDetail} />;
}
