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

interface QuestionOption {
  id?: string;
  option_text: string;
  is_correct: boolean;
}

interface EditQuestionDialogProps {
  questionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionUpdated: () => void;
}

interface QuestionData {
  id: string;
  question_type: 'mcq' | 'written';
  statement: string;
  statement_format: string;
  explanation: string | null;
  options: QuestionOption[];
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
    question_type: 'mcq' as 'mcq' | 'written',
    statement: '',
    explanation: '',
    options: [
      { option_text: '', is_correct: true },
      { option_text: '', is_correct: false },
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
      const response = await fetch(`/api/admin/questions/${questionId}`);
      if (response.ok) {
        const data = await response.json();
        const question: QuestionData = data.question;
        
        // Extract explanation text from JSON format if needed
        let explanationText = '';
        if (question.explanation) {
          try {
            const explanationJson = typeof question.explanation === 'string' 
              ? JSON.parse(question.explanation) 
              : question.explanation;
            
            // Extract text from TipTap JSON structure
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
          question_type: question.question_type,
          statement: question.statement,
          explanation: explanationText,
          options: question.options.length > 0 
            ? question.options 
            : [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
              ],
        });
      }
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

    if (formData.question_type === 'mcq') {
      if (formData.options.length < 2) {
        alert('MCQ must have at least 2 options');
        return;
      }
      if (formData.options.some((opt) => !opt.option_text.trim())) {
        alert('Please fill in all options');
        return;
      }
      if (!formData.options.some((opt) => opt.is_correct)) {
        alert('Please select at least one correct option');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        question_type: formData.question_type,
        statement: formData.statement,
        statement_format: 'text' as const,
        explanation: formData.explanation.trim()
          ? {
              type: 'doc',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: formData.explanation }] }],
            }
          : null,
        options: formData.question_type === 'mcq' ? formData.options : [],
      };

      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onOpenChange(false);
        onQuestionUpdated();
      } else {
        const error = await response.json();
        alert(error.details || error.error || 'Failed to update question');
      }
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
