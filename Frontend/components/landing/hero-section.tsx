import Link from "next/link"
import { ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuestionPreview } from "./question-preview"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="-z-10 absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]"
        aria-hidden
      />
      <div className="items-center gap-14 grid lg:grid-cols-2 mx-auto px-6 py-20 md:py-28 max-w-6xl">
        <div className="flex flex-col items-center lg:items-start gap-7 text-center lg:text-left">
          <Badge variant="secondary" className="px-4 py-1 font-medium text-sm">
            Built for medical students in Egypt
          </Badge>
          <h1 className="font-bold text-foreground text-4xl md:text-6xl leading-tight tracking-tight">
            Practice real past exams.{" "}
            <span className="text-primary">Master every module.</span>
          </h1>
          <p className="max-w-xl text-muted-foreground text-lg leading-relaxed">
            Axonelix brings old exams, custom tests and answer review into one focused
            platform, so you always know what to study next.
          </p>
          <div className="flex sm:flex-row flex-col items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in to your account</Link>
            </Button>
          </div>
          <p className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="size-4 text-primary" />
            Trusted by hundreds of medical students across Egypt
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <QuestionPreview />
        </div>
      </div>
    </section>
  )
}
