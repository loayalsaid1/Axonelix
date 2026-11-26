import {
  BookOpen,
  CalendarDays,
  Database,
  Flame,
  GraduationCap,
  Layers,
  LayoutGrid,
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
  status?: string
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
  { label: "Why Axonelix", href: "#why" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
]

export const CURRICULUM_POINTS: LandingFeature[] = [
  {
    icon: GraduationCap,
    title: "Mapped to your university",
    description:
      "Every question is tied to the modules, subjects, chapters and lessons you actually study, not a generic US syllabus.",
  },
  {
    icon: ScrollText,
    title: "Your exam formats",
    description:
      "Practice for the exams you'll sit: Finals, Midterms, TBL and Flipped, theoretical and practical.",
  },
  {
    icon: LayoutGrid,
    title: "One complete platform",
    description:
      "Question bank, quiz generator, tracking, library and planner together, so you don't need to juggle five apps.",
  },
]

export const FEATURES: LandingFeature[] = [
  {
    icon: Database,
    title: "Question Bank",
    description:
      "A comprehensive bank of MCQ and written questions with explanations, organised exactly like your curriculum.",
  },
  {
    icon: SlidersHorizontal,
    title: "Quiz Generator",
    description:
      "Generate a quiz from any mix of modules, subjects, chapters or lessons. Pick all, unread or previously wrong questions.",
  },
  {
    icon: Target,
    title: "Weak-Spot Tracking",
    description:
      "Every answer is tracked and traced back to its lesson, chapter and subject, so you can retest exactly what you missed.",
  },
  {
    icon: ScrollText,
    title: "Old Exams",
    description:
      "Real past papers from your university, organised by year and exam type.",
  },
  {
    icon: BookOpen,
    title: "Library",
    status: "Rolling out",
    description:
      "Structured study content for each module, linked to its questions. Opening module by module.",
  },
  {
    icon: ListChecks,
    title: "Review & Explanations",
    description:
      "Mark questions, eliminate options, then review every answer. Revisit any past quiz in My Tests.",
  },
  {
    icon: CalendarDays,
    title: "Study Planner",
    description: "Plan your study days with simple tasks and keep revision on schedule.",
  },
  {
    icon: Flame,
    title: "Dashboard & Streaks",
    description: "See your progress at a glance and keep your daily study streak alive.",
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
      "Generate quizzes from your curriculum, read the explanations and retest your weak spots.",
  },
]

export const ROADMAP: RoadmapItem[] = [
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
      "Medical students at Egyptian universities who want one complete study platform built around their own curriculum.",
  },
  {
    question: "How is it different from international question banks?",
    answer:
      "International banks are written for US board exams. Axonelix is built around your university's curriculum and exam formats, so every question maps to a module, subject, chapter and lesson you actually study.",
  },
  {
    question: "What's in the question bank?",
    answer:
      "MCQ and written questions with explanations for each module, plus old exams organised by year and type: Final, Midterm, TBL and Flipped. Coverage keeps growing every term.",
  },
  {
    question: "How do I get access?",
    answer:
      "Create a free account, then request access to the modules you need. Once approved, the question bank and old exams for those modules are unlocked.",
  },
  {
    question: "When will the library and flashcards open?",
    answer:
      "They're rolling out module by module as content is completed. You'll see them in your account as soon as your modules are ready.",
  },
  {
    question: "Does it work on my phone?",
    answer: "Yes. Axonelix works in any modern browser on desktop and mobile.",
  },
]
