'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QuestionFilter } from '@/components/admin/shared/question-filter';
import { useQuestionFilters } from '@/hooks/admin/use-question-filters';
import { useApiFetch } from '@/hooks/use-api-fetch';

interface Question {
  id: string;
  statement: string;
  questionType: string;
  questionOptions: any[];
}

interface AddQuestionToExamDialogProps {
  examId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionAdded: () => void;
}

export default function AddQuestionToExamDialog({
  examId,
  open,
  onOpenChange,
  onQuestionAdded,
}: AddQuestionToExamDialogProps) {
  const authFetch = useApiFetch();
  const [submitting, setSubmitting] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');


  // Use the question filters hook
  const {
    filterOptions,
    optionsLoading,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
    getFilteredSubjects,
    getFilteredChapters,
    getFilteredLessons,
    questions,
    loading,
    fetchQuestions,
  } = useQuestionFilters();

  // Handle subject toggle for multi-select
  const handleSubjectToggle = (subjectId: string) => {
    const currentSubjectIds = filters.subjectIds || [];
    const newSubjectIds = currentSubjectIds.includes(subjectId)
      ? currentSubjectIds.filter(id => id !== subjectId)
      : [...currentSubjectIds, subjectId];

    updateFilter('subjectIds', newSubjectIds);
  };

  // Handle chapter toggle for multi-select
  const handleChapterToggle = (chapterId: string) => {
    const currentChapterIds = filters.chapterIds || [];
    const newChapterIds = currentChapterIds.includes(chapterId)
      ? currentChapterIds.filter(id => id !== chapterId)
      : [...currentChapterIds, chapterId];

    updateFilter('chapterIds', newChapterIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedQuestion) {
      alert('Please select a question');
      return;
    }

    setSubmitting(true);

    try {
      await authFetch(`/questions/${selectedQuestion}`, {
        method: 'PATCH',
        body: { oldExamId: Number(examId) },
      });

      setSelectedQuestion('');
      onQuestionAdded();
    } catch (error) {
      console.error('Failed to add question:', error);
      alert('Failed to add question to exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Question to Exam</DialogTitle>
          <DialogDescription>
            Filter and select questions from your question bank
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* Filters sidebar */}
          <div className="w-[300px] flex-shrink-0 overflow-y-auto max-h-[calc(90vh-220px)]">
            {optionsLoading ? (
              <div className="space-y-4 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <QuestionFilter
                search={filters.search || ''}
                moduleId={filters.moduleId || ''}
                subjectIds={filters.subjectIds || []}
                chapterIds={filters.chapterIds || []}
                // lessonId={filters.lessonId}
                isMisc={filters.isMisc}
                modules={filterOptions.modules}
                subjects={getFilteredSubjects()}
                chapters={getFilteredChapters()}
                lessons={getFilteredLessons()}
                loading={loading}
                onSearchChange={(value) => updateFilter('search', value)}
                onModuleChange={(value) => updateFilter('moduleId', value)}
                onSubjectToggle={handleSubjectToggle}
                onChapterToggle={handleChapterToggle}
                // onLessonChange={(value) => updateFilter('lessonId', value)}
                onIsMiscChange={(value) => updateFilter('isMisc', value)}
                onApplyFilters={fetchQuestions}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </div>

          {/* Questions list */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto max-h-[calc(90vh-220px)]">
                <div className="space-y-3 pr-4">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-2">
                        {hasActiveFilters
                          ? 'No questions found matching your filters'
                          : 'Apply filters to search for questions'}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <RadioGroup value={selectedQuestion} onValueChange={setSelectedQuestion}>
                      {questions.map((question) => (
                        <div
                          key={question.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <RadioGroupItem value={question.id} id={question.id} className="mt-1" />
                          <Label htmlFor={question.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                                {question.questionType}
                              </span>
                            </div>
                            <p className="font-medium text-sm line-clamp-2">{question.statement}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.questionOptions?.length || 0} options
                            </p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    setSelectedQuestion('');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || !selectedQuestion}>
                  {submitting ? 'Adding...' : 'Add Question'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
