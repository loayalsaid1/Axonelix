'use client';

import { useState, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Pencil, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuestionStatementPreview } from '@/components/shared/question-statement-preview';

const EditorPreview = lazy(() => import("@/components/editor-preview/EditorPreview"));

interface AdminQuestionCardProps {
  id: string;
  statement: string;
  statementFormat?: 'text' | 'tiptap_json';
  questionType: 'mcq' | 'written';
  options: { id: string; optionText: string; isCorrect: boolean }[];
  isMisc: boolean;
  explanation?: any;
  href: string;
  onDelete: () => void;
  onEdit: () => void;
}

export function AdminQuestionCard({
  id,
  statement,
  statementFormat = 'text',
  questionType,
  options,
  isMisc,
  explanation,
  href,
  onDelete,
  onEdit,
}: AdminQuestionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={questionType === 'mcq' ? 'default' : 'secondary'}>
                {questionType.toUpperCase()}
              </Badge>
              {isMisc && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  Misc
                </Badge>
              )}
              {statementFormat === 'tiptap_json' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Rich Text
                </Badge>
              )}
            </div>
            
            <QuestionStatementPreview
              statement={statement}
              statementFormat={statementFormat}
              richContainerClassName="max-h-80 rounded-lg border bg-muted/10 p-3"
              plainClassName="text-lg line-clamp-2"
            />

            {questionType === 'mcq' && options.length > 0 && (
              <CardDescription className="mt-2">
                {options.length} option{options.length !== 1 ? 's' : ''}
                {' • '}
                {options.filter((o) => o.isCorrect).length} correct
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {explanation && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="View Explanation">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Question Explanation</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Suspense fallback={<div className="h-32 w-full bg-muted animate-pulse rounded-md" />}>
                      <EditorPreview content={explanation} />
                    </Suspense>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to delete this question?')) {
                  onDelete();
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {questionType === 'mcq' && options.length > 0 && (
        <CardContent>
          <div className="text-sm space-y-1">
            {options.map((option, optIndex) => (
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
        </CardContent>
      )}
    </Card>
  );
}
