'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ExternalLink, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdminQuestionCardProps {
  id: string;
  statement: string;
  questionType: 'mcq' | 'written';
  options: { id: string; optionText: string; isCorrect: boolean }[];
  isMisc: boolean;
  href: string;
  onDelete: () => void;
  onEdit: () => void;
}

export function AdminQuestionCard({
  id,
  statement,
  questionType,
  options,
  isMisc,
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
            </div>
            <CardTitle className="text-lg line-clamp-2">{statement}</CardTitle>
            {questionType === 'mcq' && options.length > 0 && (
              <CardDescription className="mt-2">
                {options.length} option{options.length !== 1 ? 's' : ''}
                {' • '}
                {options.filter((o) => o.isCorrect).length} correct
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="ghost" size="icon" asChild>
              <Link href={href}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button> */}
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
            {options.slice(0, 3).map((option, optIndex) => (
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
            {options.length > 3 && (
              <div className="text-xs text-muted-foreground mt-1">
                +{options.length - 3} more option{options.length - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
