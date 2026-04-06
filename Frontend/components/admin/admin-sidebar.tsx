"use client"

import * as React from "react"
import {
	LayoutDashboard,
	BookOpen,
	FileQuestion,
	Layers,
	TrendingUp,
	HandCoins,
	Users,
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

const adminNavGroups = [
	{
		label: "Main",
		items: [
			{
				title: "Dashboard",
				url: "/admin",
				icon: LayoutDashboard,
			},
			{
				title: "Analytics",
				url: "/admin/analytics",
				icon: TrendingUp,
			},
		],
	},
	{
		label: "Content",
		items: [
			{
				title: "Materials",
				url: "/admin/materials",
				icon: BookOpen,
			},
			{
				title: "Questions",
				url: "/admin/questions",
				icon: FileQuestion,
			},
			{
				title: "Flashcards",
				url: "/admin/flashcards",
				icon: Layers,
			},
		],
	},
	{
		label: "Users",
		items: [
			{
				title: "Payments",
				url: "/admin/subscriptions",
				icon: HandCoins,
			},
			{
				title: "Users",
				url: "/admin/users",
				icon: Users,
			},
		],
	},
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<AppSidebarHeader />
			</SidebarHeader>
			<SidebarContent>
				{adminNavGroups.map((group) => (
					<NavMain key={group.label} label={group.label} items={group.items} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<ThemeSwitcher />
				<NavUser isAdmin />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
