'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2, BookOpen } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuestionStatementPreview } from '@/components/shared/question-statement-preview';
import { ContentRenderer } from '@/components/shared/content-renderer';

interface ExamQuestionCardProps {
  question: {
    id: string;
    questionType: string;
    statement: string;
    statementFormat?: 'text' | 'tiptap_json';
    questionOptions: { id: string; optionText: string; isCorrect: boolean }[];
    explanation?: string | Record<string, unknown> | null;
    explanationIsLegacyFormat?: boolean;
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
                {question.statementFormat === 'tiptap_json' && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Rich Text
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">
                Question {index + 1}
              </CardTitle>
            </div>
            <div className="flex gap-1 sm:gap-2">
              {question.explanation && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" title="View Explanation">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Question Explanation</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <ContentRenderer
                        content={question.explanation}
                        isLegacyFormat={question.explanationIsLegacyFormat}
                        className="prose dark:prose-invert max-w-none"
                        loadingClassName="h-32 w-full bg-muted animate-pulse rounded-md"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Statement
            </p>
            <QuestionStatementPreview
              statement={question.statement}
              statementFormat={question.statementFormat}
              richContainerClassName="rounded-lg border bg-muted/10 p-3"
              plainClassName="whitespace-pre-wrap text-sm leading-relaxed text-foreground"
            />
          </div>

          {question.questionOptions && question.questionOptions.length > 0 && (
            <div className="space-y-2">
              {question.questionOptions.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={`p-2 flex items-center justify-between rounded text-sm border ${option.isCorrect
                    ? 'bg-primary/10 border-primary shadow-sm text-primary font-medium'
                    : 'bg-muted/50 border-border text-muted-foreground'
                    }`}
                >
                  <div>
                    <span className="font-semibold">{String.fromCharCode(65 + optIndex)}:</span>{' '}
                    {option.optionText}
                  </div>
                  {option.isCorrect && (
                    <Badge variant="default" className="h-5 px-2 text-[10px] uppercase tracking-wider">
                      Correct
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
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
