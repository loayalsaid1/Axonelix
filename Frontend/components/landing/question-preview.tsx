import { Check, Flag, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type OptionState = "default" | "eliminated" | "correct"

const OPTIONS: { label: string; text: string; state: OptionState }[] = [
  { label: "A", text: "Atrial flutter", state: "eliminated" },
  { label: "B", text: "Atrial fibrillation", state: "correct" },
  { label: "C", text: "Sinus arrhythmia", state: "default" },
  { label: "D", text: "Multifocal atrial tachycardia", state: "eliminated" },
]

const OPTION_STYLES: Record<OptionState, string> = {
  default: "border-border",
  eliminated: "border-border text-muted-foreground/60 line-through",
  correct: "border-emerald-500/60 bg-emerald-500/10 text-foreground",
}

export function QuestionPreview() {
  return (
    <div className="relative w-full max-w-md animate-float">
      <div className="-z-10 absolute -inset-6 bg-primary/15 blur-3xl rounded-full" aria-hidden />
      <div className="flex flex-col gap-4 bg-card shadow-xl p-5 border border-border rounded-2xl text-left">
        <div className="flex justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">Cardiovascular Module</Badge>
            <Badge variant="outline">Arrhythmias</Badge>
            <Badge variant="outline">MCQ</Badge>
          </div>
          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 text-xs">
            <Flag className="size-3.5" /> Marked
          </span>
        </div>

        <p className="font-medium text-foreground text-sm leading-relaxed">
          A 62-year-old man presents with palpitations and an irregularly irregular pulse. ECG
          shows no discernible P waves. What is the most likely diagnosis?
        </p>

        <ul className="flex flex-col gap-2">
          {OPTIONS.map(({ label, text, state }) => (
            <li
              key={label}
              className={cn("flex items-center gap-3 px-3 py-2 border rounded-lg text-sm", OPTION_STYLES[state])}
            >
              <span className="flex justify-center items-center bg-muted rounded-md size-6 font-semibold text-xs no-underline shrink-0">
                {label}
              </span>
              <span className="flex-1">{text}</span>
              {state === "correct" && <Check className="size-4 text-emerald-600 dark:text-emerald-400" />}
            </li>
          ))}
        </ul>

        <div className="flex gap-2 bg-muted/60 p-3 rounded-lg text-muted-foreground text-xs leading-relaxed">
          <Lightbulb className="mt-0.5 size-4 text-primary shrink-0" />
          <p>
            <span className="font-semibold text-foreground">Explanation: </span>
            An irregularly irregular rhythm with absent P waves is characteristic of atrial
            fibrillation.
          </p>
        </div>
      </div>
    </div>
  )
}
