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
import { LegacyHtmlEditor } from '@/components/admin/shared/legacy-html-editor';

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
  explanationIsLegacyFormat?: boolean;
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
  const statementEditorRef = useRef<SimpleEditorRefHandler>(null);
  const [initialExplanationContent, setInitialExplanationContent] = useState<JSONContent | undefined>(undefined);
  const [legacyExplanation, setLegacyExplanation] = useState<string | null>(null);
  const [isEditingLegacyExplanation, setIsEditingLegacyExplanation] = useState<boolean>(false);
  const [initialStatementRich, setInitialStatementRich] = useState<JSONContent | null>(null);

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
    statementFormat: 'text' as 'text' | 'tiptap_json',
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
      setLegacyExplanation(null);
      setIsEditingLegacyExplanation(false);
      setInitialStatementRich(null);
      setQuestionOldExamId(null);
    }
  }, [open, questionId]);

  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    // If we're switching format, pull the current rich text if leaving rich mode
    if (updates.statementFormat && updates.statementFormat !== formData.statementFormat) {
      if (formData.statementFormat === 'tiptap_json') {
        const currentJson = statementEditorRef.current?.getJSON() || null;
        setInitialStatementRich(currentJson);
      }
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const fetchQuestion = async () => {
    if (!questionId) return;

    setFetching(true);
    try {
      const question = await authFetch<QuestionData>(`/questions/${questionId}`);

      let explanationContent: JSONContent | undefined = undefined;
      let legacyHtml: string | null = null;
      let isLegacy = false;

      if (question.explanation) {
        if (question.explanationIsLegacyFormat) {
          isLegacy = true;
          legacyHtml = typeof question.explanation === 'string'
            ? question.explanation
            : JSON.stringify(question.explanation);
        } else {
          try {
            explanationContent = typeof question.explanation === 'string'
              ? JSON.parse(question.explanation)
              : question.explanation;
          } catch {
            isLegacy = true;
            legacyHtml = typeof question.explanation === 'string'
              ? question.explanation
              : JSON.stringify(question.explanation);
          }
        }
      }

      setInitialExplanationContent(explanationContent);
      setLegacyExplanation(legacyHtml);
      setIsEditingLegacyExplanation(isLegacy);

      let statementRichContent: JSONContent | null = null;
      let statementText = '';
      
      if (question.statementFormat === 'tiptap_json') {
        try {
          statementRichContent = JSON.parse(question.statement);
        } catch (e) {
          console.error('Failed to parse rich statement', e);
          statementText = question.statement;
        }
      } else {
        statementText = question.statement;
      }
      
      setInitialStatementRich(statementRichContent);
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
        statement: statementText,
        statementFormat: (question.statementFormat as 'text' | 'tiptap_json') || 'text',
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

    let finalStatement = formData.statement;
    if (formData.statementFormat === 'tiptap_json') {
      const currentJson = statementEditorRef.current?.getJSON() || null;
      if (!currentJson || (currentJson.content?.length === 1 && !currentJson.content[0].content)) {
        alert('Please enter a rich text statement');
        return;
      }
      finalStatement = JSON.stringify(currentJson);
    } else if (!formData.statement.trim()) {
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
      let finalExplanation: any = null;
      let finalExplanationIsLegacy = false;

      if (isEditingLegacyExplanation) {
        finalExplanation = legacyExplanation || null;
        finalExplanationIsLegacy = true;
      } else {
        const explanationContent = explanationEditorRef.current?.getJSON() || null;
        const isExplanationEmpty = !explanationContent ||
          (explanationContent.content?.length === 1 &&
            !explanationContent.content[0].content &&
            explanationContent.content[0].type === 'paragraph');

        finalExplanation = isExplanationEmpty ? null : explanationContent;
        finalExplanationIsLegacy = false;
      }

      const payload = {
        questionType: formData.questionType,
        statement: finalStatement,
        statementFormat: formData.statementFormat,
        explanation: finalExplanation,
        explanationIsLegacyFormat: finalExplanationIsLegacy,
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
      <DialogContent className="sm:max-w-200 max-h-[90vh] overflow-y-auto">
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
                statementFormat: formData.statementFormat,
                explanation: formData.explanation,
                options: formData.options,
              }}
              statementText={formData.statement}
              statementRich={initialStatementRich}
              onStatementTextChange={(text) => setFormData({ ...formData, statement: text })}
              statementEditorRef={statementEditorRef}
              onChange={handleFormDataChange}
            />

            {/* Explanation Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Explanation (Optional)</Label>
                {legacyExplanation && !isEditingLegacyExplanation && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingLegacyExplanation(true)}
                    className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    ← Switch back to CKEditor 5
                  </Button>
                )}
              </div>
              {isEditingLegacyExplanation ? (
                <LegacyHtmlEditor
                  value={legacyExplanation || ''}
                  onChange={(val) => setLegacyExplanation(val)}
                  onSwitchToTipTap={() => setIsEditingLegacyExplanation(false)}
                  title="Legacy Explanation (CKEditor 5)"
                />
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <SimpleEditor
                    ref={explanationEditorRef}
                    initialContent={initialExplanationContent}
                    key={questionId || 'new'}
                    showHtmlAssistant={true}
                  />
                </div>
              )}
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
