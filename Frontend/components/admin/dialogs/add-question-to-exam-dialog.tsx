'use client';

import React, { useState, useEffect } from 'react';
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
import { QuestionsPagination } from '@/components/library/QuestionsPagination';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showFilters, setShowFilters] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    if (!open) {
      setFiltersApplied(false);
      setShowFilters(true);
      setSelectedQuestion('');
    }
  }, [open]);

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
    pagination,
    goToPage,
    setLimit,
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

  const handleApplyFilters = () => {
    setSelectedQuestion('');
    setShowFilters(false);
    setFiltersApplied(true);
    fetchQuestions(1);
  };

  const handlePageChange = (page: number) => {
    setSelectedQuestion('');
    goToPage(page);
  };

  const handleLimitChange = (limit: number) => {
    setSelectedQuestion('');
    setLimit(limit);
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
      <DialogContent className="@container/add-question-dialog flex max-h-[90vh] flex-col sm:max-w-225">
        <DialogHeader>
          <DialogTitle>Add Question to Exam</DialogTitle>
          <DialogDescription>
            Filter and select questions from your question bank
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto @xl/add-question-dialog:flex-row @xl/add-question-dialog:gap-6 @xl/add-question-dialog:overflow-hidden">
          {/* Mobile Filters Toggle */}
          {filtersApplied && (
            <div className="@xl/add-question-dialog:hidden shrink-0">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowFilters((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Back to Questions' : 'Edit Filters'}
              </Button>
            </div>
          )}

          {/* Filters sidebar */}
          <div
            className={cn(
              "w-full @xl/add-question-dialog:w-75 @xl/add-question-dialog:shrink-0 @xl/add-question-dialog:overflow-y-auto",
              !showFilters && "hidden @xl/add-question-dialog:block"
            )}
          >
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
                onApplyFilters={handleApplyFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </div>

          {/* Questions list */}
          <div
            className={cn(
              "flex flex-col min-h-0 flex-1 @xl/add-question-dialog:overflow-hidden",
              showFilters && "hidden @xl/add-question-dialog:flex"
            )}
          >
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto">
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

              {!loading && pagination.total > 0 && (
                <QuestionsPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  limit={pagination.limit}
                  total={pagination.total}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}

              <div className="mt-4 flex flex-col-reverse gap-3 border-t pt-4 @md/add-question-dialog:flex-row @md/add-question-dialog:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full @md/add-question-dialog:w-auto"
                  onClick={() => {
                    onOpenChange(false);
                    setSelectedQuestion('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedQuestion}
                  className="w-full @md/add-question-dialog:w-auto"
                >
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
