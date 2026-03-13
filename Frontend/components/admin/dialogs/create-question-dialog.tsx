'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useModules } from '@/hooks/admin/use-modules';
import { useUniversities } from '@/hooks/admin/use-universities';
import { useOldExams } from '@/hooks/admin/use-old-exams';
import { useOldExamManager } from '@/hooks/admin/use-old-exam-manager';
import { useMaterialHierarchy } from '@/hooks/admin/use-material-hierarchy';
import { MaterialSelector } from '@/components/admin/shared/material-selector';
import { OldExamForm } from '@/components/admin/shared/old-exam-form';
import { QuestionFormFields } from '@/components/admin/shared/question-form-fields';
import { useApiFetch } from '@/hooks/use-api-fetch';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import type { JSONContent } from '@tiptap/react';

interface SimpleEditorRefHandler {
  getJSON: () => JSONContent | null;
}

interface CreateQuestionDialogProps {
  parentId?: string;
  parentType?: 'lesson' | 'chapter' | 'old_exam';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionCreated: () => void;
}

export default function CreateQuestionDialog({
  parentId,
  parentType,
  open,
  onOpenChange,
  onQuestionCreated,
}: CreateQuestionDialogProps) {
  const authFetch = useApiFetch();
  const [loading, setLoading] = useState(false);
  const explanationEditorRef = useRef<SimpleEditorRefHandler>(null);
  const [editorKey, setEditorKey] = useState(0);

  // Use custom hooks
  const { modules } = useModules();
  const { universities, createUniversity } = useUniversities();
  const { exams, refetch: refetchExams } = useOldExams();
  const { findOrCreateOldExam } = useOldExamManager(exams);

  // Material hierarchy
  const {
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

  // Old exam toggle and data
  const [isOldExamQuestion, setIsOldExamQuestion] = useState(false);

  // Old exam data
  const [oldExamData, setOldExamData] = useState({
    universityId: '',
    moduleId: '',
    moduleType: 'theoretical' as 'theoretical' | 'practical',
    examType: 'final' as 'final' | 'midterm' | 'tpl' | 'flipped',
    year: new Date().getFullYear(),
  });

  // Question form data
  const [formData, setFormData] = useState({
    questionType: 'mcq' as 'mcq' | 'written',
    statement: '',
    statementFormat: 'text' as 'text' | 'tiptap_json',
    explanation: '',
    lessonId: parentType === 'lesson' ? parentId : '',
    chapterId: parentType === 'chapter' ? parentId : '',
    oldExamId: parentType === 'old_exam' ? parentId : '',
    isMisc: false,
    reference: { text: '' } as { id?: number; text: string },
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
    ],
  });



  const handleCreateUniversity = async (name: string) => {
    const newUniversity = await createUniversity(name);
    if (newUniversity) {
      setOldExamData({ ...oldExamData, universityId: newUniversity.id });
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.statement) {
      alert('Please fill in statement');
      return;
    }

    // Validate old exam data if marked as old exam
    if (isOldExamQuestion) {
      if (!oldExamData.universityId || !oldExamData.moduleId) {
        alert('Please select university and module for old exam question');
        return;
      }
    }

    // Validate material linkage (unless it's a parent context or old exam only)
    if (!parentId && !isOldExamQuestion) {
      if (!formData.chapterId) {
        alert('Please select a chapter for this question');
        return;
      }
    }

    if (formData.questionType === 'mcq' && formData.options.some((opt) => !opt.optionText)) {
      alert('Please fill in all options');
      return;
    }

    setLoading(true);

    try {
      let oldExamId = formData.oldExamId;

      // If this is marked as an old exam question, create or find the old exam
      if (isOldExamQuestion) {
        const examId = await findOrCreateOldExam(oldExamData);
        if (!examId) {
          alert('Failed to create old exam');
          setLoading(false);
          return;
        }
        oldExamId = examId;
        // Refresh exams list
        refetchExams();
      }

      const explanationContent = explanationEditorRef.current?.getJSON() || null;
      // Check if it's empty
      const isExplanationEmpty = !explanationContent ||
        (explanationContent.content?.length === 1 &&
          !explanationContent.content[0].content &&
          explanationContent.content[0].type === 'paragraph');

      const payload = {
        questionType: formData.questionType,
        statement: formData.statement,
        statementFormat: formData.statementFormat,
        lessonId: formData.lessonId ? Number(formData.lessonId) : null,
        chapterId: formData.chapterId ? Number(formData.chapterId) : null,
        isMisc: formData.isMisc,
        oldExamId: oldExamId ? Number(oldExamId) : null,
        reference: formData.reference?.text ? formData.reference : null,
        explanation: isExplanationEmpty ? null : explanationContent,
        options: formData.questionType === 'mcq'
          ? formData.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
          : [],
      };

      await authFetch('/questions', { method: 'POST', body: payload });

      setFormData((prev) => ({
        ...prev,
        questionType: 'mcq',
        statement: '',
        statementFormat: 'text',
        explanation: '',
        reference: { text: '' },
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
        ],
      }));

      setEditorKey(prev => prev + 1);

      // Keep selectedModule / selectedSubject / selectedChapter and
      // old exam toggles as-is so the dialog remains in the same context.
      onQuestionCreated();
    } catch (error) {
      console.error('Failed to create question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Question</DialogTitle>
          <DialogDescription>Add a question to the database</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Material Linking Section */}
          {!parentId && (
            <div className="space-y-4">
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
                  setFormData((prev) => ({ ...prev, lessonId: '', chapterId: '' }));
                }}
                onSubjectChange={(subjectId) => {
                  setSelectedSubject(subjectId);
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

              {/* Old Exam Checkbox */}
              <div className="flex items-center space-x-2 pt-4 border-t">
                <Checkbox
                  id="old-exam-toggle"
                  checked={isOldExamQuestion}
                  onCheckedChange={(checked) => setIsOldExamQuestion(!!checked)}
                />
                <Label
                  htmlFor="old-exam-toggle"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Mark as old exam question
                </Label>
              </div>

              {/* Old Exam Form - shown when checkbox is checked */}
              {isOldExamQuestion && (
                <div className="pt-4 border-t">
                  <OldExamForm
                    data={oldExamData}
                    onChange={setOldExamData}
                    modules={modules}
                    universities={universities}
                    onCreateUniversity={handleCreateUniversity}
                  />
                </div>
              )}
            </div>
          )}

          {/* Parent context display (when called from a parent) */}
          {parentId && (
            <div className="p-4 rounded-lg border bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Adding question to: <strong>{parentType}</strong>
              </p>
            </div>
          )}

          {/* Question Form Fields */}
          <QuestionFormFields
            data={{
              questionType: formData.questionType,
              statement: formData.statement,
              explanation: formData.explanation,
              options: formData.options,
              reference: formData.reference,
            }}
            onChange={(data) => setFormData((prev) => ({ ...prev, ...data }))}
          />

          {/* Explanation Editor */}
          <div className="space-y-2">
            <Label>Explanation (Optional)</Label>
            <div className="border rounded-lg overflow-hidden">
              <SimpleEditor key={editorKey} ref={explanationEditorRef} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
