'use client';

import { lazy, Suspense } from 'react';
import type { JSONContent } from '@tiptap/core';
import { cn } from '@/lib/utils';

const EditorPreview = lazy(() => import('@/components/editor-preview/EditorPreview'));

type RichContent = JSONContent | string | null | undefined;

interface ContentRendererProps {
  content: RichContent;
  isLegacyFormat?: boolean;
  className?: string;
  loadingClassName?: string;
}

function parseJsonContent(content: string): JSONContent | null {
  try {
    return JSON.parse(content) as JSONContent;
  } catch {
    return null;
  }
}

export function ContentRenderer({
  content,
  isLegacyFormat = false,
  className,
  loadingClassName = 'h-32 w-full rounded-md bg-muted animate-pulse',
}: ContentRendererProps) {
  if (content == null) {
    return null;
  }

  if (isLegacyFormat) {
    return (
      <div
        className={cn('prose dark:prose-invert max-w-none', className)}
        dangerouslySetInnerHTML={{ __html: typeof content === 'string' ? content : '' }}
      />
    );
  }

  if (typeof content === 'string') {
    const parsed = parseJsonContent(content);

    if (!parsed) {
      return (
        <div
          className={cn('prose dark:prose-invert max-w-none', className)}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    return (
      <div className={className}>
        <Suspense fallback={<div className={loadingClassName} />}>
          <EditorPreview content={parsed} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={className}>
      <Suspense fallback={<div className={loadingClassName} />}>
        <EditorPreview content={content as JSONContent} />
      </Suspense>
    </div>
  );
}