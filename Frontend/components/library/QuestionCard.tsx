"use client";

import { useState, Suspense, lazy } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const EditorPreview = lazy(
  () => import("@/components/editor-preview/EditorPreview"),
);
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types/questions";

interface QuestionCardProps {
  question: Question;
  /** 1-based global index across all pages */
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const handleOptionClick = (optionId: number) => {
    setSelectedOptionId(optionId);
    setShowAnswer(true); // Auto-reveal answers after selection
  };

  return (
    <Card className="hover:border-primary/50 overflow-hidden transition-colors">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shadow font-mono">
              Q{index}
            </Badge>
            <Badge
              variant={
                question.questionType === "mcq" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {question.questionType === "mcq" ? "Multiple Choice" : "Written"}
            </Badge>
            {question.isMisc && (
              <Badge variant="outline" className="border-dashed">
                Misc
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="shadow">
            #{question.id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Statement */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {question.statement}
        </p>

        {/* Options (MCQ only) */}
        {question.questionType === "mcq" &&
          question.questionOptions.length > 0 && (
            <ol
              className="space-y-2 mt-4"
              style={{ listStyleType: "upper-alpha" }}
            >
              {question.questionOptions.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCorrect = opt.isCorrect;
                const showFeedback = showAnswer && isSelected;

                return (
                  <li
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    className={cn(
                      "flex items-start gap-3 px-3 py-2.5 border rounded-lg text-sm transition-all cursor-pointer",
                      showAnswer && isCorrect
                        ? "border-green-300 bg-green-50/60 dark:border-green-800 dark:bg-green-900/10"
                        : isSelected && showFeedback && !isCorrect
                          ? "border-red-300 bg-red-50/60 dark:border-red-800 dark:bg-red-900/10"
                          : isSelected
                            ? "border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-900/10"
                            : "border-transparent bg-muted/40 hover:bg-muted/60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex justify-center items-center mt-0.5 border rounded-full w-4 h-4 transition-colors shrink-0",
                        showAnswer && isCorrect
                          ? "border-green-500 bg-green-500 text-white"
                          : isSelected && showFeedback && !isCorrect
                            ? "border-red-500 bg-red-500 text-white"
                            : isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-muted-foreground/30",
                      )}
                    >
                      {showAnswer && isCorrect && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span
                        className={cn(
                          "transition-colors",
                          showAnswer && isCorrect
                            ? "font-medium text-green-700 dark:text-green-400"
                            : isSelected && showFeedback && !isCorrect
                              ? "font-medium text-red-700 dark:text-red-400"
                              : isSelected
                                ? "font-medium text-blue-700 dark:text-blue-400"
                                : "",
                        )}
                      >
                        {opt.optionText}
                      </span>
                      {isSelected && showFeedback && !isCorrect && (
                        <p className="mt-1 text-red-600 dark:text-red-400 text-xs">
                          Incorrect
                        </p>
                      )}
                      {showAnswer &&
                        isCorrect &&
                        selectedOptionId !== opt.id && (
                          <p className="mt-1 text-green-600 dark:text-green-400 text-xs">
                            Correct Answer
                          </p>
                        )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-dashed">
        {question.questionType === "mcq" &&
          question.questionOptions.length > 0 && (
            <div className="flex gap-2">
              <Button
                // variant="ghost"
                size="sm"
                onClick={() => setShowAnswer((v) => !v)}
                // className="text-muted-foreground hover:text-primary"
              >
                {showAnswer ? "Hide Answer" : "Show Answer"}
              </Button>
              {selectedOptionId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedOptionId(null);
                    setShowAnswer(false);
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  Reset
                </Button>
              )}
            </div>
          )}

        {question.explanation && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
              >
                View Explanation
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Explanation</DialogTitle>
              </DialogHeader>
              <DialogDescription className="overflow-auto">
                <div className="overflow-auto max-h-[70vh]">
                  {question.explanation ? (
                    <Suspense
                      fallback={
                        <div className="pt-2">
                          <div className="bg-muted/40 rounded-xl w-full h-40" />
                        </div>
                      }
                    >
                      <EditorPreview content={question.explanation} />
                    </Suspense>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      No explanation available.
                    </p>
                  )}
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
