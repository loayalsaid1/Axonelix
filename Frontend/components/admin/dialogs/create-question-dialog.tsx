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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useModules } from '@/hooks/admin/use-modules';
import { useUniversities } from '@/hooks/admin/use-universities';
import { useOldExams } from '@/hooks/admin/use-old-exams';
import { useOldExamManager } from '@/hooks/admin/use-old-exam-manager';
import { MaterialSelector } from '@/components/admin/shared/material-selector';
import { OldExamForm } from '@/components/admin/shared/old-exam-form';
import { QuestionFormFields } from '@/components/admin/shared/question-form-fields';
import { apiFetch } from '@/lib/api/client';

interface CreateQuestionDialogProps {
  parentId?: string;
  parentType?: 'lesson' | 'chapter' | 'old_exam';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionCreated: () => void;
}

interface Subject {
  id: string;
  name: string;
  type: string;
}

interface Chapter {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  name: string;
}

export default function CreateQuestionDialog({
  parentId,
  parentType,
  open,
  onOpenChange,
  onQuestionCreated,
}: CreateQuestionDialogProps) {
  const [loading, setLoading] = useState(false);

  // Use custom hooks
  const { modules } = useModules();
  const { universities, createUniversity } = useUniversities();
  const { exams, refetch: refetchExams } = useOldExams();
  const { findOrCreateOldExam } = useOldExamManager(exams);

  // Material hierarchy state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Material selection state
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');

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
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
    ],
  });



  // Effects for cascading material selection
  useEffect(() => {
    if (selectedModule) {
      fetchSubjects(selectedModule);
      setSelectedSubject('');
      setSelectedChapter('');
      setFormData((prev) => ({ ...prev, lessonId: '', chapterId: '' }));
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject);
      setSelectedChapter('');
      setFormData((prev) => ({ ...prev, lessonId: '', chapterId: '' }));
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedChapter) {
      fetchLessons(selectedChapter);
      setFormData((prev) => ({ ...prev, chapterId: selectedChapter, lessonId: '' }));
    }
  }, [selectedChapter]);

  // Fetch functions for material hierarchy
  const fetchSubjects = async (moduleId: string) => {
    try {
      const data = await apiFetch<any[]>(`/materials/subjects?moduleId=${moduleId}`);
      setSubjects(data.map((s) => ({ id: String(s.id), name: s.name, type: s.type })));
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    try {
      const data = await apiFetch<any[]>(`/materials/subjects/${subjectId}/chapters`);
      setChapters(data.map((c) => ({ id: String(c.id), name: c.name })));
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    }
  };

  const fetchLessons = async (chapterId: string) => {
    try {
      const data = await apiFetch<any[]>(`/materials/chapters/${chapterId}/lessons`);
      setLessons(data.map((l) => ({ id: String(l.id), name: l.name })));
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  // Handler for creating university
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

      const payload = {
        questionType: formData.questionType,
        statement: formData.statement,
        statementFormat: formData.statementFormat,
        lessonId: formData.lessonId ? Number(formData.lessonId) : null,
        chapterId: formData.chapterId ? Number(formData.chapterId) : null,
        isMisc: formData.isMisc,
        oldExamId: oldExamId ? Number(oldExamId) : null,
        explanation: formData.explanation
          ? {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: formData.explanation }] }],
          }
          : null,
        options: formData.questionType === 'mcq'
          ? formData.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
          : [],
      };

      await apiFetch('/questions', { method: 'POST', body: payload });

      setFormData((prev) => ({
        ...prev,
        questionType: 'mcq',
        statement: '',
        statementFormat: 'text',
        explanation: '',
        options: [
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
        ],
      }));

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
                onModuleChange={setSelectedModule}
                onSubjectChange={setSelectedSubject}
                onChapterChange={setSelectedChapter}
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
            }}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />

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
