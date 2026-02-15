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
import { GraduationCap, BookOpen, FlaskConical, FolderOpen } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const recentLessons = [
  {
    lessonId: 'bones-overview',
    lessonTitle: 'Overview of Bones',
    subjectTitle: 'Anatomy',
    href: '/materials/theoretical/anatomy/skeletal-system/bones-overview',
  },
]

type ModulePageProps = {
  params: Promise<{ moduleType: string }>
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleType } = await params
  const module = mockMaterials.modules.find((m) => m.type === moduleType)

  if (!module) {
    notFound()
  }

  const breadcrumbs = [
    { label: 'Materials', href: '/' },
    { label: module.type.charAt(0).toUpperCase() + module.type.slice(1), href: `/materials/${moduleType}` },
  ]

  const Icon = module.type === 'theoretical' ? BookOpen : FlaskConical

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
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight capitalize">{module.type} Studies</h1>
                <p className="text-muted-foreground">
                  {module.type === 'theoretical' 
                    ? 'Comprehensive theoretical lessons covering medical sciences'
                    : 'Hands-on practical skills and clinical procedures'}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="mb-4 text-xl font-semibold">Subjects</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {module.subjects.map((subject) => (
                  <Link key={subject.id} href={`/materials/${moduleType}/${subject.id}`}>
                    <Card className="transition-colors hover:bg-accent">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <FolderOpen className="size-5 text-primary" />
                          {subject.title}
                        </CardTitle>
                        <CardDescription>
                          {subject.chapters.length} {subject.chapters.length === 1 ? 'chapter' : 'chapters'}
                          {subject.miscellaneous && ` + miscellaneous`}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
