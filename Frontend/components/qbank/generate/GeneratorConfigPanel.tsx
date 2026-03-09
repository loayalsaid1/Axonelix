'use client';

import { Loader2, Sparkles, ToggleLeft, Users, Clock, HelpCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { GeneratorState, GeneratorAction } from '@/hooks/use-quiz-generator';
import type { QuestionType, QuestionStatus } from '@/lib/types/quizzes';

// ─── Available count badge ────────────────────────────────────────────────────

function AvailableCountBadge({
  count,
  loading,
  questionCount,
}: {
  count: number | null;
  loading: boolean;
  questionCount: number;
}) {
  if (loading) {
    return (
      <Badge variant="secondary" className="gap-1.5 h-5 font-normal text-xs">
        <Loader2 className="size-3 animate-spin" />
        Counting…
      </Badge>
    );
  }
  if (count === null) return null;

  const canGenerate = count >= questionCount;

  return (
    <Badge
      variant="outline"
      className={
        canGenerate
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 h-5 text-xs font-medium'
          : 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 h-5 text-xs font-medium'
      }
    >
      {count.toLocaleString()} available
    </Badge>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

interface GeneratorConfigPanelProps {
  state: GeneratorState;
  dispatch: React.Dispatch<GeneratorAction>;
  onGenerate: () => void;
  totalSelected: number;
}

export function GeneratorConfigPanel({ state, dispatch, onGenerate, totalSelected }: GeneratorConfigPanelProps) {
  const enoughAvailable = state.availableCount !== null && state.availableCount > 0 && state.questionCount <= state.availableCount;
  const notGenerating = !state.isGenerating;

  const canGenerate = enoughAvailable && notGenerating;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable config area */}
      <ScrollArea className="flex-1 overflow-y-auto" >
        <div className="space-y-8 mx-auto px-6 py-8 max-w-2xl">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="font-bold text-2xl">Configure Test</h1>
            <p className="text-muted-foreground text-sm">
              Pick question filters, set the count, then generate your test.
            </p>
          </div>

          {/* ── Question Type ── */}
          <section className="space-y-3">
            <Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <HelpCircle className="size-3.5" />
              Question Type
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              className="flex gap-3 w-full"
              value={state.questionType ?? 'mixed'}
              onValueChange={(v) => {
                if (!v) return;
                dispatch({ type: 'SET_QUESTION_TYPE', value: v === 'mixed' ? null : (v as QuestionType) });
              }}
            >
              <ToggleGroupItem
                value="mixed"
                className="flex-col flex-1 items-center gap-1.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-2 py-3 border border-border data-[state=on]:border-primary rounded-lg h-auto font-medium text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-sm transition-all"
              >
                <span className="text-base">📋</span>
                <span>Mixed</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="mcq"
                className="flex-col flex-1 items-center gap-1.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-2 py-3 border border-border data-[state=on]:border-primary rounded-lg h-auto font-medium text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-sm transition-all"
              >
                <span className="text-base">🔘</span>
                <span>MCQ</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="written"
                className="flex-col flex-1 items-center gap-1.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-2 py-3 border border-border data-[state=on]:border-primary rounded-lg h-auto font-medium text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-sm transition-all"
              >
                <span className="text-base">✍️</span>
                <span>Written</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <Separator />

          {/* ── Status filter ── */}
          <section className="space-y-3">
            <Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <Users className="size-3.5" />
              Question Pool
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              className="flex gap-2 w-full"
              value={state.questionStatus}
              onValueChange={(v) => {
                if (!v) return;
                dispatch({ type: 'SET_QUESTION_STATUS', value: v as QuestionStatus });
              }}
            >
              <ToggleGroupItem
                value="all"
                className="flex-col flex-1 items-start gap-0.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-3 py-2.5 border border-border data-[state=on]:border-primary rounded-lg h-auto text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-left transition-all"
              >
                <span className="font-semibold text-xs">All</span>
                <span className="font-normal text-[10px] text-muted-foreground leading-tight">
                  Every matching question
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="unread"
                className="flex-col flex-1 items-start gap-0.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-3 py-2.5 border border-border data-[state=on]:border-primary rounded-lg h-auto text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-left transition-all"
              >
                <span className="font-semibold text-xs">Unread</span>
                <span className="font-normal text-[10px] text-muted-foreground leading-tight">
                  Never answered before
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="incorrect_only"
                className="flex-col flex-1 items-start gap-0.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-3 py-2.5 border border-border data-[state=on]:border-primary rounded-lg h-auto text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-left transition-all"
              >
                <span className="font-semibold text-xs">Incorrect</span>
                <span className="font-normal text-[10px] text-muted-foreground leading-tight">
                  Last attempt was wrong
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <Separator />

          {/* ── Question Count ── */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                <Clock className="size-3.5" />
                Number of Questions
              </Label>
              <div className="flex items-center gap-3">
                <span className="font-bold tabular-nums text-primary text-2xl">
                  {state.questionCount}
                </span>
                <AvailableCountBadge
                  count={state.availableCount}
                  loading={state.isCountLoading}
                  questionCount={state.questionCount}
                />
              </div>
            </div>

            <Slider
              min={1}
              max={Math.min(40, state.availableCount || Infinity)}
              step={1}
              value={[state.questionCount]}
              onValueChange={([v]) =>
                dispatch({ type: 'SET_QUESTION_COUNT', value: v })
              }
              className="w-full"
            />

            <div className="flex justify-between text-[10px] text-muted-foreground/50">
              <span>1</span>
              <span>{Math.min(40, state.availableCount || Infinity)}</span>
            </div>
          </section>

          <Separator />

          {/* ── Test mode (disabled) ── */}
          <section className="space-y-3 opacity-50 pointer-events-none select-none">
            <Label className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              <ToggleLeft className="size-3.5" />
              Test Mode
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="px-1.5 h-4 text-[9px] cursor-default">
                    Coming soon
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Timed mode is not yet available.
                </TooltipContent>
              </Tooltip>
            </Label>
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={1}
              className="flex gap-3 w-full"
              value="tutor"
              onValueChange={() => {}}
            >
              <ToggleGroupItem
                value="tutor"
                className="flex-col flex-1 items-center gap-1.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-2 py-3 border border-border data-[state=on]:border-primary rounded-lg h-auto font-medium text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-sm transition-all"
              >
                <span className="text-base">📖</span>
                <span>Tutor</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="timed"
                className="flex-col flex-1 items-center gap-1.5 bg-muted/30 data-[state=on]:bg-primary/10 hover:bg-muted/60 data-[state=on]:shadow-sm px-2 py-3 border border-border data-[state=on]:border-primary rounded-lg h-auto font-medium text-muted-foreground data-[state=on]:text-primary hover:text-foreground text-sm transition-all"
              >
                <span className="text-base">⏱️</span>
                <span>Timed</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </section>

          <Separator />

          {/* ── Optional title ── */}
          <section className="space-y-2">
            <Label
              htmlFor="quiz-title"
              className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider"
            >
              <BookOpen className="size-3.5" />
              Test Title
              <span className="font-normal text-[10px] text-muted-foreground/50 normal-case">
                (optional)
              </span>
            </Label>
            <Input
              id="quiz-title"
              placeholder="e.g. Cardiology mid-session review…"
              value={state.title}
              onChange={(e) => dispatch({ type: 'SET_TITLE', value: e.target.value })}
              className="h-9"
            />
          </section>
        </div>
      </ScrollArea>

      {/* ── Generate button ── */}
      <div className="bg-card/50 backdrop-blur px-6 py-4 border-border border-t shrink-0">
        <div className="flex justify-between items-center gap-4 mx-auto max-w-2xl">
          <div className="text-muted-foreground text-sm">
            {state.availableCount !== null && state.availableCount < state.questionCount && (
              <span className="text-amber-600 dark:text-amber-400 text-xs">
                Only {state.availableCount} question{state.availableCount !== 1 ? 's' : ''} available — reduce the count.
              </span>
            )}
          </div>
          <Button
            size="lg"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="gap-2 min-w-40"
          >
            {state.isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Generate Test
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
