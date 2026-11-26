import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="px-6 pb-20 md:pb-24">
      <div className="flex flex-col items-center gap-6 bg-primary shadow-lg mx-auto px-6 py-14 rounded-3xl max-w-5xl text-primary-foreground text-center">
        <h2 className="font-semibold text-3xl md:text-4xl tracking-tight">
          Join hundreds of medical students across Egypt
        </h2>
        <p className="max-w-lg text-primary-foreground/80">
          Practice smarter with real past exams and focused review, all in one place.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/sign-up">
            Create your account <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
