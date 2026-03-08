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
import { QuestionFormFields } from '@/components/admin/shared/question-form-fields';
import { apiFetch } from '@/lib/api/client';

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
  statementFormat: string;
  explanation: string | null;
  questionOptions: QuestionOption[];
}

export default function EditQuestionDialog({
  questionId,
  open,
  onOpenChange,
  onQuestionUpdated,
}: EditQuestionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Question form data
  const [formData, setFormData] = useState({
    questionType: 'mcq' as 'mcq' | 'written',
    statement: '',
    explanation: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
    ],
  });

  // Fetch question data when dialog opens
  useEffect(() => {
    if (open && questionId) {
      fetchQuestion();
    }
  }, [open, questionId]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    setFetching(true);
    try {
      const question = await apiFetch<QuestionData>(`/questions/${questionId}`);

      let explanationText = '';
      if (question.explanation) {
        try {
          const explanationJson = typeof question.explanation === 'string'
            ? JSON.parse(question.explanation)
            : question.explanation;
          if (explanationJson?.content) {
            explanationText = explanationJson.content
              .flatMap((node: any) =>
                node.content?.map((c: any) => c.text).join(' ') || ''
              )
              .join(' ');
          }
        } catch (e) {
          explanationText = String(question.explanation);
        }
      }

      setFormData({
        questionType: question.questionType,
        statement: question.statement,
        explanation: explanationText,
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
      const payload = {
        questionType: formData.questionType,
        statement: formData.statement,
        statementFormat: 'text' as const,
        explanation: formData.explanation.trim()
          ? {
            type: 'doc',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: formData.explanation }] }],
          }
          : null,
        options: formData.questionType === 'mcq'
          ? formData.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect }))
          : [],
      };

      await apiFetch(`/questions/${questionId}`, {
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

        {fetching ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading question data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
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
