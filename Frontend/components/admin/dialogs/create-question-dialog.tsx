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
    university_id: '',
    module_id: '',
    module_type: 'theoretical' as 'theoretical' | 'practical',
    exam_type: 'final' as 'final' | 'midterm' | 'tpl' | 'flipped',
    year: new Date().getFullYear(),
  });
  
  // Question form data
  const [formData, setFormData] = useState({
    question_type: 'mcq' as 'mcq' | 'written',
    statement: '',
    statement_format: 'text' as 'text' | 'tiptap_json',
    explanation: '',
    lesson_id: parentType === 'lesson' ? parentId : '',
    chapter_id: parentType === 'chapter' ? parentId : '',
    old_exam_id: parentType === 'old_exam' ? parentId : '',
    is_misc: false,
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
    ],
  });

  

  // Effects for cascading material selection
  useEffect(() => {
    if (selectedModule) {
      fetchSubjects(selectedModule);
      setSelectedSubject('');
      setSelectedChapter('');
      setFormData({ ...formData, lesson_id: '', chapter_id: '' });
    }
  }, [selectedModule]);

  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject);
      setSelectedChapter('');
      setFormData({ ...formData, lesson_id: '', chapter_id: '' });
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedChapter) {
      fetchLessons(selectedChapter);
      setFormData({ ...formData, chapter_id: selectedChapter, lesson_id: '' });
    }
  }, [selectedChapter]);

  // Fetch functions for material hierarchy
  const fetchSubjects = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}/subjects`);
      const data = await res.json();
      setSubjects(data.subjects || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    try {
      const res = await fetch(`/api/admin/subjects/${subjectId}/chapters`);
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    }
  };

  const fetchLessons = async (chapterId: string) => {
    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}/lessons`);
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  // Handler for creating university
  const handleCreateUniversity = async (name: string) => {
    const newUniversity = await createUniversity(name);
    if (newUniversity) {
      setOldExamData({ ...oldExamData, university_id: newUniversity.id });
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
      if (!oldExamData.university_id || !oldExamData.module_id) {
        alert('Please select university and module for old exam question');
        return;
      }
    }

    // Validate material linkage (unless it's a parent context or old exam only)
    if (!parentId && !isOldExamQuestion) {
      if (!formData.chapter_id) {
        alert('Please select a chapter for this question');
        return;
      }
    }

    if (formData.question_type === 'mcq' && formData.options.some((opt) => !opt.option_text)) {
      alert('Please fill in all options');
      return;
    }

    setLoading(true);

    try {
      let oldExamId = formData.old_exam_id;

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
        ...formData,
        old_exam_id: oldExamId || null,
        explanation: formData.explanation
          ? {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: formData.explanation }] }],
            }
          : null,
      };

      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Clear only the statement, explanation and options so the user can
        // quickly add another question while keeping the selected material
        // hierarchy and old-exam state intact.
        setFormData((prev) => ({
          ...prev,
          question_type: 'mcq',
          statement: '',
          statement_format: 'text',
          explanation: '',
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false },
          ],
        }));

        // Keep selectedModule / selectedSubject / selectedChapter and
        // old exam toggles as-is so the dialog remains in the same context.
        onQuestionCreated();
      }
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
                lessonId={formData.lesson_id || ''}
                isMisc={formData.is_misc}
                onModuleChange={setSelectedModule}
                onSubjectChange={setSelectedSubject}
                onChapterChange={setSelectedChapter}
                onLessonChange={(lessonId) =>
                  setFormData({ ...formData, lesson_id: lessonId })
                }
                onIsMiscChange={(isMisc) => setFormData({ ...formData, is_misc: isMisc })}
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
              question_type: formData.question_type,
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
