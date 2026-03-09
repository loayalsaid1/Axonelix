'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExamQuestionCardProps {
  question: {
    id: string;
    questionType: string;
    statement: string;
    questionOptions: { id: string; optionText: string; isCorrect: boolean }[];
  };
  index: number;
  onRemove: (questionId: string) => void;
}

export function ExamQuestionCard({ question, index, onRemove }: ExamQuestionCardProps) {
  return (
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Remove this question from the exam?')) {
                onRemove(question.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
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
  );
}
