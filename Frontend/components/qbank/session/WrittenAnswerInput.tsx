'use client';

import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface WrittenAnswerInputProps {
  questionId: number;
  value?: string;
  disabled?: boolean;
  onChange: (text: string) => void;
}

export function WrittenAnswerInput({ questionId, value = '', disabled, onChange }: WrittenAnswerInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="space-y-2">
      <Label className="font-medium text-muted-foreground text-xs">Your Answer</Label>
      <Textarea
        ref={ref}
        key={questionId} // remount on question change to reset
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={disabled ? "No answer provided" : "Type your answer here…"}
        className={cn(
          'min-h-30 overflow-hidden text-sm leading-relaxed resize-none',
          'bg-card border-border focus-visible:border-primary disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        rows={5}
      />
      <p className="text-[10px] text-muted-foreground/50 text-right">
        {value.length} characters
      </p>
    </div>
  );
}
