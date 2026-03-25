'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExamQuestionCardProps {
  question: {
    id: string;
    questionType: string;
    statement: string;
    questionOptions: { id: string; optionText: string; isCorrect: boolean }[];
    lessonId?: string | null;
    chapterId?: string | null;
  };
  index: number;
  onRemove: (questionId: string) => void;
  onEdit?: () => void;
}

export function ExamQuestionCard({ question, index, onRemove, onEdit }: ExamQuestionCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isOrphanIfRemoved = !question.lessonId && !question.chapterId;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {question.questionType.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="text-lg">
                Question {index + 1}: {question.statement}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit2 className="h-4 w-4 text-blue-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {question.questionOptions && question.questionOptions.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              {question.questionOptions.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-2 rounded text-sm ${option.isCorrect
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-gray-50 border border-gray-100'
                    }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + optIndex)}:</span>{' '}
                  {option.optionText}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {isOrphanIfRemoved
                ? "Warning: Since this question is only attached to this exam, it will be automatically deleted from the entire system. Are you sure you want to proceed?"
                : "Are you sure you want to remove this question from the exam? It will not be deleted from the question bank."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove(question.id);
                setShowConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isOrphanIfRemoved ? "Delete Completely" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
