import {
  BookOpen,
  CalendarDays,
  Flame,
  Layers,
  ListChecks,
  ScrollText,
  SlidersHorizontal,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react"

export interface LandingFeature {
  icon: LucideIcon
  title: string
  description: string
}

export interface RoadmapItem extends LandingFeature {
  status: string
}

export interface LandingStep {
  title: string
  description: string
}

export interface LandingFaq {
  question: string
  answer: string
}

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "What's next", href: "#whats-next" },
  { label: "FAQ", href: "#faq" },
]

export const FEATURES: LandingFeature[] = [
  {
    icon: ScrollText,
    title: "Old Exams",
    description:
      "Past papers organised by university, year and exam type (Final, Midterm, TBL and Flipped) for both theoretical and practical subjects.",
  },
  {
    icon: SlidersHorizontal,
    title: "Custom Tests",
    description:
      "Build a test from any mix of modules, subjects, chapters or lessons. Choose MCQ or written, and all, unread or previously wrong questions.",
  },
  {
    icon: Target,
    title: "Weak-Spot Tracking",
    description:
      "Every answer is tracked. Retest only what you got wrong, with each question traced back to its lesson, chapter and subject.",
  },
  {
    icon: ListChecks,
    title: "Review & Explanations",
    description:
      "Mark questions, eliminate options as you think, then review every answer with explanations. Revisit any past test in My Tests.",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description:
      "Plan your study days with simple tasks and keep your revision on schedule.",
  },
  {
    icon: Flame,
    title: "Dashboard & Streaks",
    description:
      "See your activity at a glance and keep your daily study streak alive.",
  },
]

export const STEPS: LandingStep[] = [
  {
    title: "Create your account",
    description: "Sign up in seconds and set up your profile.",
  },
  {
    title: "Unlock your modules",
    description: "Request access to the modules you're studying this term.",
  },
  {
    title: "Practice & review",
    description:
      "Take old exams or custom tests, read the explanations and retest your weak spots.",
  },
]

export const ROADMAP: RoadmapItem[] = [
  {
    icon: BookOpen,
    title: "Library",
    status: "Rolling out",
    description:
      "Structured lessons for every module, from subjects to chapters to lessons, with linked questions. Opening module by module as content is completed.",
  },
  {
    icon: Layers,
    title: "Flashcards",
    status: "Rolling out",
    description:
      "Decks built around your lessons for quick active recall. Opening alongside the library.",
  },
  {
    icon: Sparkles,
    title: "Smart Insights",
    status: "In the works",
    description:
      "Deeper performance analytics and spaced repetition for questions and flashcards, built on the answer tracking already running today.",
  },
]

export const FAQS: LandingFaq[] = [
  {
    question: "Who is Axonelix for?",
    answer:
      "Medical students in Egypt who want focused, exam-oriented practice for their modules.",
  },
  {
    question: "Which exams are included?",
    answer:
      "Old exams from Egyptian universities, organised by year and exam type: Final, Midterm, TBL and Flipped. Coverage keeps growing every term.",
  },
  {
    question: "How do I get access?",
    answer:
      "Create a free account, then request access to the modules you need. Once approved, all questions and old exams in those modules are unlocked.",
  },
  {
    question: "When will the library and flashcards open?",
    answer:
      "They're rolling out module by module as content is completed. You'll see them in your account as soon as your modules are ready.",
  },
  {
    question: "Does it work on my phone?",
    answer:
      "Yes. Axonelix works in any modern browser on desktop and mobile.",
  },
]
