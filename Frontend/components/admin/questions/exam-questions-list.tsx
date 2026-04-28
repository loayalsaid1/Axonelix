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
import { QuestionsPagination } from '@/components/library/QuestionsPagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QUESTION_TYPES, type QuestionType } from '@/lib/types/questions';

interface ExamQuestionsListProps {
  examId: string;
}

const ALL_QUESTION_TYPES = 'all';
type QuestionTypeFilterValue = QuestionType | typeof ALL_QUESTION_TYPES;
const QUESTION_TYPE_SET: ReadonlySet<string> = new Set(QUESTION_TYPES);

function isQuestionTypeFilterValue(value: string): value is QuestionTypeFilterValue {
  return value === ALL_QUESTION_TYPES || QUESTION_TYPE_SET.has(value);
}

export function ExamQuestionsList({ examId }: ExamQuestionsListProps) {
  const [questionType, setQuestionType] = useState<QuestionType | undefined>();
  const { questions, loading, removeQuestion, refetch, pagination, goToPage, setLimit } = useExamQuestions(
    examId,
    questionType,
  );
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

  const handleQuestionTypeChange = (value: string) => {
    if (!isQuestionTypeFilterValue(value)) return;
    setQuestionType(value === ALL_QUESTION_TYPES ? undefined : value);
    goToPage(1);
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-foreground">Questions ({pagination.total})</h2>

        <div className="flex w-full flex-col-reverse justify-between gap-3 md:w-auto md:flex-row md:items-center">
          <Select
            value={questionType ?? ALL_QUESTION_TYPES}
            onValueChange={handleQuestionTypeChange}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_QUESTION_TYPES}>All types</SelectItem>
              <SelectItem value="mcq">MCQ</SelectItem>
              <SelectItem value="written">Written</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full justify-center gap-2 md:w-auto">
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
      ) : pagination.total === 0 ? (
        <AdminEmptyState
          title={questionType ? `No ${questionType.toUpperCase()} questions found` : 'No questions in this exam yet'}
          description={
            questionType
              ? 'Try another question type or clear the filter.'
              : 'Add questions from your question bank or create new ones'
          }
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

          <QuestionsPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            limit={pagination.limit}
            total={pagination.total}
            onPageChange={goToPage}
            onLimitChange={setLimit}
          />
        </div>
      )}
    </>
  );
}
