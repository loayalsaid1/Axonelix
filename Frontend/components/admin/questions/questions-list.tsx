'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useQuestionFilters } from '@/hooks/admin/use-question-filters';
import { useToast } from '@/hooks/use-toast';
import { AdminEmptyState } from '@/components/admin/shared/admin-empty-state';
import { AdminLoadingGrid } from '@/components/admin/shared/admin-loading-grid';
import { AdminQuestionCard } from '@/components/admin/questions/admin-question-card';
import { QuestionFilter } from '@/components/admin/shared/question-filter';
import CreateQuestionDialog from '@/components/admin/dialogs/create-question-dialog';
import EditQuestionDialog from '@/components/admin/dialogs/edit-question-dialog';

export function QuestionsList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
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
    refetch,
  } = useQuestionFilters();

  const { toast } = useToast();

  // Track if filters have been applied at least once
  const [filtersApplied, setFiltersApplied] = useState(false);

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    fetchQuestions();
  };

  const handleClearFilters = () => {
    clearFilters();
    setFiltersApplied(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refetch questions after deletion
        if (filtersApplied) {
          fetchQuestions();
        }
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const handleQuestionCreated = () => {
    // setShowCreateDialog(false);
    if (filtersApplied) {
      refetch();
    }
    toast({ title: 'Question created', description: 'The question was added successfully.' });
  };

  const handleQuestionUpdated = () => {
    setEditingQuestionId(null);
    if (filtersApplied) {
      refetch();
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    const currentSubjects = filters.subjectIds || [];
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter(id => id !== subjectId)
      : [...currentSubjects, subjectId];
    updateFilter('subjectIds', newSubjects);
  };

  const handleChapterToggle = (chapterId: string) => {
    const currentChapters = filters.chapterIds || [];
    const newChapters = currentChapters.includes(chapterId)
      ? currentChapters.filter(id => id !== chapterId)
      : [...currentChapters, chapterId];
    updateFilter('chapterIds', newChapters);
  };

  const handleLessonToggle = (lessonId: string) => {
    const currentLessons = filters.lessonIds || [];
    const newLessons = currentLessons.includes(lessonId)
      ? currentLessons.filter(id => id !== lessonId)
      : [...currentLessons, lessonId];
    updateFilter('lessonIds', newLessons);
  };

  return (
    <div className="space-y-6">
      <CreateQuestionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onQuestionCreated={handleQuestionCreated}
      />

      <EditQuestionDialog
        questionId={editingQuestionId}
        open={!!editingQuestionId}
        onOpenChange={(open) => !open && setEditingQuestionId(null)}
        onQuestionUpdated={handleQuestionUpdated}
      />

      {/* Action Bar */}
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Question
        </Button>
      </div>

      {/* Filter Card */}
      <QuestionFilter
        search={filters.search || ''}
        moduleId={filters.moduleId || ''}
        subjectIds={filters.subjectIds || []}
        chapterIds={filters.chapterIds || []}
        lessonIds={filters.lessonIds || []}
        isMisc={filters.isMisc}
        modules={filterOptions.modules}
        subjects={getFilteredSubjects()}
        chapters={getFilteredChapters()}
        lessons={getFilteredLessons()}
        loading={loading || optionsLoading}
        onSearchChange={(value) => updateFilter('search', value)}
        onModuleChange={(value) => updateFilter('moduleId', value)}
        onSubjectToggle={handleSubjectToggle}
        onChapterToggle={handleChapterToggle}
        onLessonToggle={handleLessonToggle}
        onIsMiscChange={(value) => updateFilter('isMisc', value)}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        showApplyButton={true}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Section */}
      {loading ? (
        <AdminLoadingGrid count={5} className="space-y-4" />
      ) : !filtersApplied ? (
        <AdminEmptyState
          title="Ready to search"
          description="Click 'Apply Filters' to see all questions, or select specific filters to narrow your search"
        />
      ) : questions.length === 0 ? (
        <AdminEmptyState
          title="No questions found"
          description="No questions match your current filters. Try adjusting your search criteria or click 'Clear' to reset."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            </p>
          </div>
          {questions.map((question) => (
            <AdminQuestionCard
              key={question.id}
              id={question.id}
              statement={question.statement}
              questionType={question.question_type}
              options={question.options}
              isMisc={question.is_misc}
              href={'/admin/questions/' + question.id}
              onDelete={() => handleDeleteQuestion(question.id)}
              onEdit={() => setEditingQuestionId(question.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
