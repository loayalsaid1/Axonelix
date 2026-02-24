"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  FileQuestion,
  CreditCard,
  TrendingUp,
  CalendarDays,
} from "lucide-react"

import { AppSidebarHeader } from "@/components/app-sidebar-header"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { ThemeSwitcher } from "@/components/theme-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// Application data
const data = {
  navGroups: [
    {
      label: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/#",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "Planner",
          url: "/#",
          icon: CalendarDays,
        },
      ],
    },
    {
      label: "Study",
      items: [
        {
          title: "Library",
          url: "/library",
          icon: BookOpen,
        },
        {
          title: "QBank",
          url: "/qbank",
          icon: FileQuestion,
          items: [
            {
              title: "Old Exams",
              url: "/qbank/old-exams",
            },
            {
              title: "My Tests",
              url: "/#",
            },
            {
              title: "Generate Tests",
              url: "/#",
            },
          ],
        },
        {
          title: "Flashcards",
          url: "/#",
          icon: CreditCard,
        },
      ],
    },
    {
      label: "Analytics",
      items: [
        {
          title: "Performance",
          url: "/#",
          icon: TrendingUp,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <ThemeSwitcher />
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
