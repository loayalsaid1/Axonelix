'use client';

import { useParams } from 'next/navigation';
import { ExamHeader } from '@/components/admin/questions/exam-header';
import { ExamQuestionsList } from '@/components/admin/questions/exam-questions-list';

export default function ExamDetailsPage() {
  const params = useParams();
  const examId = params.examId as string;

  return (
    <div className="p-8">
      <ExamHeader examId={examId} />
      <ExamQuestionsList examId={examId} />
    </div>
  );
}
