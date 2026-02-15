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
import { mockMaterials } from '@/lib/mock-data'
import { GraduationCap, BookOpen } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const recentLessons = [
  {
    lessonId: 'bones-overview',
    lessonTitle: 'Overview of Bones',
    subjectTitle: 'Anatomy',
    href: '/materials/theoretical/anatomy/skeletal-system/bones-overview',
  },
]

type ChapterPageProps = {
  params: Promise<{ moduleType: string; subjectId: string; chapterId: string }>
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { moduleType, subjectId, chapterId } = await params
  const module = mockMaterials.modules.find((m) => m.type === moduleType)
  const subject = module?.subjects.find((s) => s.id === subjectId)
  
  // Check if it's miscellaneous or a regular chapter
  const isMiscellaneous = chapterId === 'miscellaneous'
  const chapter = isMiscellaneous 
    ? subject?.miscellaneous 
    : subject?.chapters.find((c) => c.id === chapterId)

  if (!module || !subject || !chapter) {
    notFound()
  }

  const breadcrumbs = [
    { label: 'Materials', href: '/' },
    { label: module.type.charAt(0).toUpperCase() + module.type.slice(1), href: `/materials/${moduleType}` },
    { label: subject.title, href: `/materials/${moduleType}/${subjectId}` },
    { label: isMiscellaneous ? 'Miscellaneous' : chapter.title, href: `/materials/${moduleType}/${subjectId}/${chapterId}` },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-1">
            <GraduationCap className="size-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">MedLearn</h2>
              <p className="text-xs text-muted-foreground">Medical Education Platform</p>
            </div>
          </div>
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
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isMiscellaneous ? 'Miscellaneous' : chapter.title}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {chapter.lessons.length} {chapter.lessons.length === 1 ? 'lesson' : 'lessons'} available
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              {chapter.lessons.map((lesson, index) => (
                <Link 
                  key={lesson.id} 
                  href={`/materials/${moduleType}/${subjectId}/${chapterId}/${lesson.id}`}
                >
                  <Card className="transition-colors hover:bg-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                          {index + 1}
                        </div>
                        {lesson.title}
                      </CardTitle>
                      <CardDescription>
                        <BookOpen className="mr-2 inline-block size-4" />
                        Click to view lesson content and practice questions
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
