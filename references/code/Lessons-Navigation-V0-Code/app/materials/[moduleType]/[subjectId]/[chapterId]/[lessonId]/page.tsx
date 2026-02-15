import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { MaterialsNav } from '@/components/materials-nav'
import { RecentLessons } from '@/components/recent-lessons'
import { LessonSearch } from '@/components/lesson-search'
import { LessonBreadcrumbs } from '@/components/lesson-breadcrumbs'
import { LessonContent } from '@/components/lesson-content'
import { mockMaterials } from '@/lib/mock-data'
import { GraduationCap } from 'lucide-react'
import { BreadcrumbItem } from '@/lib/types'

type Params = Promise<{
  moduleType: string
  subjectId: string
  chapterId: string
  lessonId: string
}>

// Mock recent lessons
const recentLessons = [
  {
    lessonId: 'bones-overview',
    lessonTitle: 'Overview of Bones',
    subjectTitle: 'Anatomy',
    href: '/materials/theoretical/anatomy/skeletal-system/bones-overview',
  },
  {
    lessonId: 'vital-signs',
    lessonTitle: 'Taking Vital Signs',
    subjectTitle: 'Clinical Skills',
    href: '/materials/practical/clinical-skills/physical-exam/vital-signs',
  },
]

export default async function LessonPage({ params }: { params: Params }) {
  const { moduleType, subjectId, chapterId, lessonId } = await params

  // Find the lesson in mock data
  const module = mockMaterials.modules.find((m) => m.type === moduleType)
  if (!module) notFound()

  const subject = module.subjects.find((s) => s.id === subjectId)
  if (!subject) notFound()

  let lesson
  let chapter
  let isMiscellaneous = false

  if (chapterId === 'miscellaneous') {
    isMiscellaneous = true
    lesson = subject.miscellaneous?.lessons.find((l) => l.id === lessonId)
  } else {
    chapter = subject.chapters.find((c) => c.id === chapterId)
    if (!chapter) notFound()
    lesson = chapter.lessons.find((l) => l.id === lessonId)
  }

  if (!lesson) notFound()

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Materials', href: '/' },
    { label: moduleType.charAt(0).toUpperCase() + moduleType.slice(1), href: `/materials/${moduleType}` },
    { label: subject.title, href: `/materials/${moduleType}/${subjectId}` },
    {
      label: isMiscellaneous ? 'Miscellaneous' : chapter!.title,
      href: isMiscellaneous
        ? `/materials/${moduleType}/${subjectId}/miscellaneous`
        : `/materials/${moduleType}/${subjectId}/${chapterId}`,
    },
    {
      label: lesson.title,
      href: `/materials/${moduleType}/${subjectId}/${chapterId}/${lessonId}`,
    },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 px-2 py-1 hover:opacity-80 transition-opacity">
            <GraduationCap className="size-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">MedLearn</h2>
              <p className="text-xs text-muted-foreground">Medical Education Platform</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-2 py-2">
            <LessonSearch materials={mockMaterials} />
          </div>
          <Separator />
          <RecentLessons lessons={recentLessons} />
          <Separator />
          <MaterialsNav materials={mockMaterials} />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <div className="px-2 py-2 text-xs text-muted-foreground">
            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono font-medium">⌘K</kbd> to search
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <LessonBreadcrumbs items={breadcrumbs} />
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl">
            <LessonContent lesson={lesson} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
