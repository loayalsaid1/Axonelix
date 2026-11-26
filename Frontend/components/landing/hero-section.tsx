import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuestionPreview } from "./question-preview"

const ENTER = "motion-safe:animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]"
        aria-hidden
      />
      <div className="items-center gap-14 grid lg:grid-cols-2 mx-auto px-6 py-20 md:py-28 max-w-6xl">
        <div className="flex flex-col items-center lg:items-start gap-7 text-center lg:text-left">
          <Badge variant="secondary" className={`px-4 py-1 font-medium text-sm ${ENTER}`}>
            Built for medical curricula in Egypt
          </Badge>
          <h1 className={`font-bold text-foreground text-4xl md:text-6xl leading-tight tracking-tight delay-100 ${ENTER}`}>
            Your curriculum.{" "}
            <span className="text-primary">One complete question bank.</span>
          </h1>
          <p className={`max-w-xl text-muted-foreground text-lg leading-relaxed delay-200 ${ENTER}`}>
            Axonelix is the all-in-one study platform for medical students in Egypt: a question
            bank mapped to your university&apos;s modules, quizzes generated from it, weak-spot
            tracking and a structured library. Built for your exams, not US boards.
          </p>
          <div className={`flex sm:flex-row flex-col items-center gap-3 delay-300 ${ENTER}`}>
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in to your account</Link>
            </Button>
          </div>
          <p className={`flex items-center gap-2 text-muted-foreground text-sm delay-400 ${ENTER}`}>
            <Users className="size-4 text-primary" />
            Trusted by hundreds of medical students across Egypt
          </p>
        </div>
        <div className={`flex justify-center lg:justify-end delay-300 duration-1000 ${ENTER}`}>
          <QuestionPreview />
        </div>
      </div>
    </section>
  )
}
