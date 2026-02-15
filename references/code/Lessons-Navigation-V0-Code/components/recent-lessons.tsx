'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'

type RecentLesson = {
  lessonId: string
  lessonTitle: string
  subjectTitle: string
  href: string
}

type RecentLessonsProps = {
  lessons: RecentLesson[]
}

export function RecentLessons({ lessons }: RecentLessonsProps) {
  if (lessons.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center gap-2">
        <Clock className="size-4" />
        Recent Lessons
      </SidebarGroupLabel>
      <SidebarMenu>
        {lessons.map((lesson) => (
          <SidebarMenuItem key={lesson.lessonId}>
            <SidebarMenuButton asChild>
              <Link href={lesson.href}>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{lesson.lessonTitle}</span>
                  <span className="text-xs text-muted-foreground">{lesson.subjectTitle}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
