'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CKEditorWrapper = dynamic(
  () => import('./ckeditor-wrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center border rounded-md bg-muted/20 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading CKEditor 5...</span>
      </div>
    ),
  }
);

interface LegacyHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSwitchToTipTap: () => void;
  title?: string;
}

export function LegacyHtmlEditor({
  value,
  onChange,
  onSwitchToTipTap,
  title = 'Legacy Format (CKEditor 5)',
}: LegacyHtmlEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyHtml = async () => {
    if (!value) {
      toast.error('No content to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('HTML copied to clipboard! You can paste it to AI or TipTap HTML Assistant.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy HTML');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
            {title}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Edit with CKEditor 5 or copy HTML to convert with AI / TipTap
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyHtml}
            className="h-8 text-xs gap-1.5"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied HTML!' : 'Copy HTML'}
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onSwitchToTipTap}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Switch to TipTap Editor →
          </Button>
        </div>
      </div>

      <CKEditorWrapper data={value} onChange={onChange} />
    </div>
  );
}
