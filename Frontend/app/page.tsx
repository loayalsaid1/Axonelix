import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, BrainCircuit, FileQuestion, TrendingUp, ArrowRight, GraduationCap } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Structured Library",
    description:
      "Navigate your curriculum through subjects, modules, chapters, and lessons — everything organised hierarchically.",
  },
  {
    icon: FileQuestion,
    title: "Question Bank",
    description:
      "Practice with curated question banks, past exams, and auto-generated tests tailored to your weak areas.",
  },
  {
    icon: BrainCircuit,
    title: "Flashcards",
    description:
      "Spaced-repetition flashcards that adapt to your performance and help you retain knowledge long-term.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description:
      "Track your progress across every topic, identify gaps, and stay on top of your study plan.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 min-h-screen">
      {/* ── Nav ── */}
      <header className="top-0 z-50 sticky flex justify-between items-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur px-6 md:px-10 border-zinc-200 dark:border-zinc-800 border-b h-16">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">Axonelix</span>
        </div>
        <nav className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">
              Get started <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col flex-1 justify-center items-center gap-8 px-6 py-24 md:py-36 text-center">
        <Badge variant="secondary" className="px-4 py-1 font-medium text-sm">
          Built for Medical Students
        </Badge>
        <h1 className="max-w-3xl font-bold text-zinc-900 dark:text-zinc-50 text-4xl md:text-6xl leading-tight tracking-tight">
          Study smarter.{" "}
          <span className="text-primary">Score higher.</span>
        </h1>
        <p className="max-w-xl text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
          Axonelix brings together your curriculum, question banks, and progress
          tracking into one focused platform — so you spend less time searching
          and more time learning.
        </p>
        <div className="flex sm:flex-row flex-col items-center gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">
              Start for free <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Sign in to your account</Link>
          </Button>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-zinc-50 dark:bg-zinc-900 px-6 md:px-10 py-20 border-zinc-100 dark:border-zinc-800 border-t">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 font-semibold text-zinc-900 dark:text-zinc-50 text-2xl md:text-3xl text-center tracking-tight">
            Everything you need, nothing you don&apos;t
          </h2>
          <div className="gap-8 grid sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 bg-white dark:bg-zinc-800 shadow-sm p-6 rounded-2xl ring-1 ring-zinc-100 dark:ring-zinc-700"
              >
                <div className="flex justify-center items-center bg-primary/10 rounded-xl size-10 text-primary">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="flex flex-col items-center gap-6 px-6 md:px-10 py-20 text-center">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 text-2xl md:text-3xl tracking-tight">
          Ready to get started?
        </h2>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Join thousands of medical students already using Axonelix to ace their exams.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-up">
            Create your free account <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-6 border-zinc-100 dark:border-zinc-800 border-t text-zinc-400 dark:text-zinc-500 text-sm text-center">
        © {new Date().getFullYear()} Axonelix. All rights reserved.
      </footer>
    </div>
  )
}
