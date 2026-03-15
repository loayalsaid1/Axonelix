'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useExamQuestions } from '@/hooks/admin/use-exam-questions';
import { toast } from 'sonner';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { ExamQuestionCard } from '@/components/admin/questions/exam-question-card';
import AddQuestionToExamDialog from '@/components/admin/dialogs/add-question-to-exam-dialog';

interface ExamQuestionsListProps {
  examId: string;
}

export function ExamQuestionsList({ examId }: ExamQuestionsListProps) {
  const { questions, loading, removeQuestion, refetch } = useExamQuestions(examId);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleRemoveQuestion = async (questionId: string) => {
    try {
      await removeQuestion(questionId);
      toast.success('Question removed from exam');
    } catch (error) {
      console.error('Failed to remove question:', error);
      toast.error('Failed to remove question');
    }
  };

  const handleQuestionAdded = () => {
    // setShowAddDialog(false);
    refetch();
    toast.success('Question added to exam successfully');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Questions ({questions.length})</h2>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      <AddQuestionToExamDialog
        examId={examId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onQuestionAdded={handleQuestionAdded}
      />

      {loading ? (
        <AdminLoadingGrid count={3} className="space-y-4" />
      ) : questions.length === 0 ? (
        <AdminEmptyState
          title="No questions in this exam yet"
          description="Add questions from your question bank"
        />
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <ExamQuestionCard
              key={question.id}
              question={question}
              index={index}
              onRemove={handleRemoveQuestion}
            />
          ))}
        </div>
      )}
    </>
  );
}
