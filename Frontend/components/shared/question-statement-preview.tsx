'use client';

import { lazy, Suspense, useMemo } from 'react';
import type { JSONContent } from '@tiptap/react';
import { cn } from '@/lib/utils';
import type { StatementFormat } from '@/lib/types/questions';

const EditorPreview = lazy(() => import('@/components/editor-preview/EditorPreview'));

interface QuestionStatementPreviewProps {
  statement: string;
  statementFormat?: StatementFormat;
  richContainerClassName?: string;
  plainClassName?: string;
}

export function QuestionStatementPreview({
  statement,
  statementFormat = 'text',
  richContainerClassName,
  plainClassName,
}: QuestionStatementPreviewProps) {
  const isRichStatement = statementFormat === 'tiptap_json';

  const parsedRichContent = useMemo<JSONContent | null>(() => {
    if (!isRichStatement) return null;

    try {
      return statement ? JSON.parse(statement) : null;
    } catch {
      return null;
    }
  }, [isRichStatement, statement]);

  if (isRichStatement) {
    return (
      <div className={cn('relative overflow-y-auto', richContainerClassName)}>
        <Suspense fallback={<div className="h-20 w-full rounded-md bg-muted animate-pulse" />}>
          <EditorPreview content={parsedRichContent} />
        </Suspense>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-background to-transparent" />
      </div>
    );
  }

  return (
    <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', plainClassName)}>
      {statement}
    </p>
  );
}