'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { QuestionFormFields } from '@/components/admin/shared/question-form-fields';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import type { JSONContent } from '@tiptap/react';

// New Imports
import { MaterialSelector } from '@/components/admin/shared/material-selector';
import { useMaterialHierarchy } from '@/hooks/admin/use-material-hierarchy';
import { useQuestionAncestors } from '@/hooks/admin/use-question-ancestors';

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null;
}

interface QuestionOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

interface EditQuestionDialogProps {
  questionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionUpdated: () => void;
}

interface QuestionData {
  id: string;
  questionType: 'mcq' | 'written';
  statement: string;
  statementFormat: 'text' | 'tiptap_json';
  explanation: string | null;
  lessonId: number | null;
  chapterId: number | null;
  oldExamId: number | null;
  isMisc: boolean | null;
  questionOptions: QuestionOption[];
}

export default function EditQuestionDialog({
  questionId,
  open,
  onOpenChange,
  onQuestionUpdated,
}: EditQuestionDialogProps) {
  const authFetch = useApiFetch();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [questionOldExamId, setQuestionOldExamId] = useState<number | null>(null);

  const explanationEditorRef = useRef<SimpleEditorRefHandler>(null);
  const [initialExplanationContent, setInitialExplanationContent] = useState<JSONContent | undefined>(undefined);

  // Use custom hooks
  const { fetchMaterialAncestors, loadingAncestors } = useQuestionAncestors();

  // Material hierarchy
  const {
    modules,
    selectedModule,
    setSelectedModule,
    selectedSubject,
    setSelectedSubject,
    selectedChapter,
    setSelectedChapter,
    subjects,
    chapters,
    lessons,
  } = useMaterialHierarchy();

  // Question form data
  const [formData, setFormData] = useState({
    questionType: 'mcq' as 'mcq' | 'written',
    statement: '',
    explanation: '',
    lessonId: '',
    chapterId: '',
    isMisc: false,
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
    ],
  });

  // Fetch question data when dialog opens
  useEffect(() => {
    if (open && questionId) {
      fetchQuestion();
    } else {
      setInitialExplanationContent(undefined);
      setQuestionOldExamId(null);
    }
  }, [open, questionId]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    setFetching(true);
    try {
      const question = await authFetch<QuestionData>(`/questions/${questionId}`);

      let explanationContent: JSONContent | undefined = undefined;
      if (question.explanation) {
        try {
          explanationContent = typeof question.explanation === 'string'
            ? JSON.parse(question.explanation)
            : question.explanation;
        } catch (e) {
          explanationContent = {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: String(question.explanation) }] }]
          };
        }
      }
      setInitialExplanationContent(explanationContent);
      setQuestionOldExamId(question.oldExamId ?? null);

      // Fetch ancestors for materials
      if (question.lessonId || question.chapterId) {
        const ancestors = await fetchMaterialAncestors(question.lessonId, question.chapterId);
        if (ancestors) {
          setSelectedModule(ancestors.moduleId);
          setSelectedSubject(ancestors.subjectId);
          setSelectedChapter(ancestors.chapterId);
        }
      }

      setFormData({
        questionType: question.questionType,
        statement: question.statement,
        explanation: '',
        lessonId: question.lessonId ? String(question.lessonId) : '',
        chapterId: question.chapterId ? String(question.chapterId) : '',
        isMisc: question.isMisc ?? false,
        options: question.questionOptions?.length > 0
          ? question.questionOptions
          : [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
          ],
      });
    } catch (error) {
      console.error('Failed to fetch question:', error);
      alert('Failed to load question data');
    } finally {
      setFetching(false);
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionId) {
      alert('No question selected');
      return;
    }

    if (!formData.statement.trim()) {
      alert('Please fill in statement');
      return;
    }

    // A question can be linked by material chapter, old exam, or both.
    if (!formData.chapterId && !questionOldExamId) {
      alert('Please select a chapter, or keep this question linked to an old exam');
      return;
    }

    if (formData.questionType === 'mcq') {
      if (formData.options.length < 2) {
        alert('MCQ must have at least 2 options');
        return;
      }
      if (formData.options.some((opt) => !opt.optionText.trim())) {
        alert('Please fill in all options');
        return;
      }
      if (!formData.options.some((opt) => opt.isCorrect)) {
        alert('Please select at least one correct option');
        return;
      }
    }

    setLoading(true);

    try {
      const explanationContent = explanationEditorRef.current?.getJSON() || null;
      // Check if it's empty
      const isExplanationEmpty = !explanationContent ||
        (explanationContent.content?.length === 1 &&
          !explanationContent.content[0].content &&
          explanationContent.content[0].type === 'paragraph');

      const payload = {
        questionType: formData.questionType,
        statement: formData.statement,
        statementFormat: 'text' as const,
        explanation: isExplanationEmpty ? null : explanationContent,
        options: formData.questionType === 'mcq'
          ? formData.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
          : [],
        lessonId: formData.lessonId ? Number(formData.lessonId) : null,
        chapterId: formData.chapterId ? Number(formData.chapterId) : null,
        isMisc: formData.isMisc,
      };

      await authFetch(`/questions/${questionId}`, {
        method: 'PATCH',
        body: payload,
      });
      onOpenChange(false);
      onQuestionUpdated();
    } catch (error) {
      console.error('Failed to update question:', error);
      alert(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>Update the question content and options</DialogDescription>
        </DialogHeader>

        {fetching || loadingAncestors ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading question data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            <MaterialSelector
              modules={modules}
              subjects={subjects}
              chapters={chapters}
              lessons={lessons}
              selectedModule={selectedModule}
              selectedSubject={selectedSubject}
              selectedChapter={selectedChapter}
              lessonId={formData.lessonId || ''}
              isMisc={formData.isMisc}
              onModuleChange={(moduleId) => {
                setSelectedModule(moduleId);
                setSelectedSubject('');
                setSelectedChapter('');
                setFormData((prev) => ({ ...prev, lessonId: '', chapterId: '' }));
              }}
              onSubjectChange={(subjectId) => {
                setSelectedSubject(subjectId);
                setSelectedChapter('');
                setFormData((prev) => ({ ...prev, lessonId: '', chapterId: '' }));
              }}
              onChapterChange={(chapterId) => {
                setSelectedChapter(chapterId);
                setFormData((prev) => ({ ...prev, chapterId: chapterId, lessonId: '' }));
              }}
              onLessonChange={(lessonId) =>
                setFormData((prev) => ({ ...prev, lessonId }))
              }
              onIsMiscChange={(isMisc) => setFormData((prev) => ({ ...prev, isMisc }))}
            />

            <div className="pt-4 border-t"></div>

            {/* Question Form Fields */}
            <QuestionFormFields
              data={{
                questionType: formData.questionType,
                statement: formData.statement,
                explanation: formData.explanation,
                options: formData.options,
              }}
              onChange={(data) => setFormData({ ...formData, ...data })}
            />

            {/* Explanation Editor */}
            <div className="space-y-2">
              <Label>Explanation (Optional)</Label>
              <div className="border rounded-lg overflow-hidden">
                <SimpleEditor
                  ref={explanationEditorRef}
                  initialContent={initialExplanationContent}
                  key={questionId || 'new'}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || fetching}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
