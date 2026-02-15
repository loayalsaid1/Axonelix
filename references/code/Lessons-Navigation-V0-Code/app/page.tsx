import Link from 'next/link'
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
import { mockMaterials } from '@/lib/mock-data'
import { GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

export default function HomePage() {
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
          <h1 className="text-lg font-semibold">Welcome to MedLearn</h1>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-balance">
                Your Medical Education Journey
              </h2>
              <p className="mt-2 text-lg text-muted-foreground text-pretty">
                Access comprehensive lessons, practice questions, and track your progress through theoretical and practical medical content.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      📚
                    </div>
                    Theoretical Studies
                </CardTitle>
                  <CardDescription>
                    Comprehensive lessons covering anatomy, physiology, and medical sciences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href="/materials/theoretical/anatomy/skeletal-system/bones-overview">
                      Start Learning
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      🔬
                    </div>
                    Practical Skills
                  </CardTitle>
                  <CardDescription>
                    Hands-on clinical skills and practical procedures for medical practice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/materials/practical/clinical-skills/physical-exam/vital-signs">
                      Explore Skills
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Navigate through your learning materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Navigation Tips:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Use the sidebar to browse through modules, subjects, and chapters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Press <kbd className="rounded bg-muted px-1 py-0.5 text-xs">⌘K</kbd> to quickly search for any lesson</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Your recently viewed lessons appear at the top of the sidebar for quick access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Each lesson includes content and practice questions to test your knowledge</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
