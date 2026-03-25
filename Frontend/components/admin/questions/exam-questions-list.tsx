'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useExamQuestions, ExamQuestion } from '@/hooks/admin/use-exam-questions';
import { toast } from 'sonner';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { ExamQuestionCard } from '@/components/admin/questions/exam-question-card';
import AddQuestionToExamDialog from '@/components/admin/dialogs/add-question-to-exam-dialog';
import CreateQuestionDialog from '@/components/admin/dialogs/create-question-dialog';
import EditQuestionDialog from '@/components/admin/dialogs/edit-question-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ExamQuestionsListProps {
  examId: string;
}

export function ExamQuestionsList({ examId }: ExamQuestionsListProps) {
  const { questions, loading, removeQuestion, refetch } = useExamQuestions(examId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<ExamQuestion | null>(null);

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
    setShowAddDialog(false);
    setShowCreateDialog(false);
    refetch();
    toast.success('Question added to exam successfully');
  };

  const handleQuestionUpdated = () => {
    setQuestionToEdit(null);
    refetch();
    toast.success('Question updated successfully');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Questions ({questions.length})</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Question
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
              <Search className="h-4 w-4 mr-2" />
              Select Existing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AddQuestionToExamDialog
        examId={examId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onQuestionAdded={handleQuestionAdded}
      />

      <CreateQuestionDialog
        parentId={examId}
        parentType="old_exam"
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onQuestionCreated={handleQuestionAdded}
      />

      {questionToEdit && (
        <EditQuestionDialog
          questionId={questionToEdit.id}
          open={!!questionToEdit}
          onOpenChange={(open) => !open && setQuestionToEdit(null)}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}

      {loading ? (
        <AdminLoadingGrid count={3} className="space-y-4" />
      ) : questions.length === 0 ? (
        <AdminEmptyState
          title="No questions in this exam yet"
          description="Add questions from your question bank or create new ones"
        />
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <ExamQuestionCard
              key={question.id}
              question={question}
              index={index}
              onRemove={handleRemoveQuestion}
              onEdit={() => setQuestionToEdit(question)}
            />
          ))}
        </div>
      )}
    </>
  );
}
