'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, BookOpen, FlaskConical, FolderOpen, FileText } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { MaterialsStructure, Module, Subject, Chapter } from '@/lib/types'

type MaterialsNavProps = {
  materials: MaterialsStructure
}

export function MaterialsNav({ materials }: MaterialsNavProps) {
  return (
    <SidebarMenu>
      {materials.modules.map((module) => (
        <ModuleItem key={module.id} module={module} />
      ))}
    </SidebarMenu>
  )
}

function ModuleItem({ module }: { module: Module }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const pathname = usePathname()
  const Icon = module.type === 'theoretical' ? BookOpen : FlaskConical
  const moduleHref = `/materials/${module.type}`
  const isActive = pathname === moduleHref

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full" asChild isActive={isActive}>
            <button>
              <Link href={moduleHref} className='flex items-center flex-1'>
                <Icon className="size-4 mr-2" />
                <span className="capitalize">{module.type}</span>
              </Link>
              <span className="sidebar-navigation-arrow">
                <ChevronRight className={`ml-auto size-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </span>
            </button>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {module.subjects.map((subject) => (
              <SubjectItem key={subject.id} subject={subject} moduleType={module.type} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SubjectItem({ subject, moduleType }: { subject: Subject; moduleType: string }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const subjectHref = `/materials/${moduleType}/${subject.id}`
  const isActive = pathname === subjectHref

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full" asChild isActive={isActive}>
            <button>
              <Link href={subjectHref} className='flex items-center flex-1'>
                <FolderOpen className="size-4 mr-2" />
                <span>{subject.title}</span>
              </Link>
              <span className="sidebar-navigation-arrow">
                <ChevronRight className={`ml-auto size-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </span>
            </button>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {subject.chapters.map((chapter) => (
              <ChapterItem
                key={chapter.id}
                chapter={chapter}
                moduleType={moduleType}
                subjectId={subject.id}
              />
            ))}
            {subject.miscellaneous && (
              <MiscellaneousItem
                miscellaneous={subject.miscellaneous}
                moduleType={moduleType}
                subjectId={subject.id}
              />
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  )
}

function ChapterItem({
  chapter,
  moduleType,
  subjectId,
}: {
  chapter: Chapter
  moduleType: string
  subjectId: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const chapterHref = `/materials/${moduleType}/${subjectId}/${chapter.id}`
  const isChapterActive = pathname === chapterHref

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full" asChild isActive={isChapterActive}>
            <button>
              <Link href={chapterHref} className='flex items-center flex-1'>
                <FileText className="size-4 mr-2" />
                <span>{chapter.title}</span>
              </Link>
              <span className="sidebar-navigation-arrow">
                <ChevronRight className={`ml-auto size-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </span>
            </button>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {chapter.lessons.map((lesson) => {
              const href = `/materials/${moduleType}/${subjectId}/${chapter.id}/${lesson.id}`
              const isActive = pathname === href

              return (
                <SidebarMenuSubItem key={lesson.id}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={href}>
                      <span>{lesson.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  )
}

function MiscellaneousItem({
  miscellaneous,
  moduleType,
  subjectId,
}: {
  miscellaneous: { id: string; lessons: Array<{ id: string; title: string }> }
  moduleType: string
  subjectId: string
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const miscHref = `/materials/${moduleType}/${subjectId}/miscellaneous`
  const isMiscActive = pathname === miscHref

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuSubItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full" asChild isActive={isMiscActive}>
            <button>

              <Link href={miscHref} className='flex items-center flex-1'>
                <FileText className="size-4 mr-2" />
                <span>Miscellaneous</span>
              </Link>
              <span className="sidebar-navigation-arrow">
                <ChevronRight className={`ml-auto size-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
              </span>
            </button>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {miscellaneous.lessons.map((lesson) => {
              const href = `/materials/${moduleType}/${subjectId}/miscellaneous/${lesson.id}`
              const isActive = pathname === href

              return (
                <SidebarMenuSubItem key={lesson.id}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={href}>
                      <span>{lesson.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuSubItem>
    </Collapsible>
  )
}
