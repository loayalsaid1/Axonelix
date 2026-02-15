'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Lesson } from '@/lib/types'

type LessonContentProps = {
  lesson: Lesson
}

export function LessonContent({ lesson }: LessonContentProps) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({})
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = () => {
    setSubmitted(true)
  }

  const handleReset = () => {
    setAnswers({})
    setSubmitted(false)
  }

  const score = React.useMemo(() => {
    if (!submitted || !lesson.questions) return 0
    const correct = lesson.questions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length
    return Math.round((correct / lesson.questions.length) * 100)
  }, [submitted, answers, lesson.questions])

  return (
    <div className="space-y-6">
      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{lesson.title}</CardTitle>
          {lesson.description && (
            <CardDescription className="text-base">{lesson.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: lesson.content || '' }}
          />
        </CardContent>
      </Card>

      {/* Questions */}
      {lesson.questions && lesson.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Practice Questions</span>
              {submitted && (
                <Badge variant={score >= 70 ? 'default' : 'destructive'} className="text-sm">
                  Score: {score}%
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Test your understanding of this lesson
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {lesson.questions.map((question, qIndex) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {qIndex + 1}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                </div>

                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) =>
                    setAnswers({ ...answers, [question.id]: parseInt(value) })
                  }
                  disabled={submitted}
                  className="ml-9 space-y-2"
                >
                  {question.options.map((option, oIndex) => {
                    const isCorrect = question.correctAnswer === oIndex
                    const isSelected = answers[question.id] === oIndex
                    const showFeedback = submitted

                    return (
                      <div
                        key={oIndex}
                        className={`flex items-center space-x-2 rounded-md border p-3 ${
                          showFeedback && isCorrect
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                            : showFeedback && isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                              : 'border-border'
                        }`}
                      >
                        <RadioGroupItem value={oIndex.toString()} id={`${question.id}-${oIndex}`} />
                        <Label
                          htmlFor={`${question.id}-${oIndex}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {option}
                        </Label>
                        {showFeedback && isCorrect && (
                          <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="size-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                    )
                  })}
                </RadioGroup>

                {qIndex < lesson.questions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length !== lesson.questions.length}
                  className="w-full sm:w-auto"
                >
                  Submit Answers
                </Button>
              ) : (
                <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto bg-transparent">
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
