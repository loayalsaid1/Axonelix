'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { MaterialsStructure } from '@/lib/types'

type LessonSearchProps = {
  materials: MaterialsStructure
}

export function LessonSearch({ materials }: LessonSearchProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Flatten all lessons for search
  const allLessons = React.useMemo(() => {
    const lessons: Array<{
      id: string
      title: string
      description?: string
      href: string
      breadcrumb: string
    }> = []

    materials.modules.forEach((module) => {
      module.subjects.forEach((subject) => {
        subject.chapters.forEach((chapter) => {
          chapter.lessons.forEach((lesson) => {
            lessons.push({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              href: `/materials/${module.type}/${subject.id}/${chapter.id}/${lesson.id}`,
              breadcrumb: `${module.type} > ${subject.title} > ${chapter.title}`,
            })
          })
        })

        if (subject.miscellaneous) {
          subject.miscellaneous.lessons.forEach((lesson) => {
            lessons.push({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              href: `/materials/${module.type}/${subject.id}/miscellaneous/${lesson.id}`,
              breadcrumb: `${module.type} > ${subject.title} > Miscellaneous`,
            })
          })
        }
      })
    })

    return lessons
  }, [materials])

  const handleSelect = (href: string) => {
    setOpen(false)
    router.push(href)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-muted-foreground bg-transparent"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4 mr-2" />
        <span className="text-sm">Search lessons...</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search lessons..." />
        <CommandList>
          <CommandEmpty>No lessons found.</CommandEmpty>
          <CommandGroup heading="Lessons">
            {allLessons.map((lesson) => (
              <CommandItem
                key={lesson.id}
                value={`${lesson.title} ${lesson.description} ${lesson.breadcrumb}`}
                onSelect={() => handleSelect(lesson.href)}
              >
                <BookOpen className="mr-2 size-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{lesson.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {lesson.breadcrumb}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
