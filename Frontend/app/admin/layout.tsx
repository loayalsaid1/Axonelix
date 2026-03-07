
import React from "react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar';
import { BookOpen, FileText, Home, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const SidebarNavItems: {href: string, icon: React.FC<React.SVGProps<SVGSVGElement>>, label: string}[] = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/materials", icon: BookOpen, label: "Materials" },
  // { href: "/admin/materials", icon: BookOpen, label: "Materials" },
  { href: "/admin/questions", icon: FileText, label: "Questions" },
];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider>
      <Sidebar className="w-64 border-r border-border bg-sidebar">
        <SidebarHeader className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">EduAdmin</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="pt-6">
          <SidebarMenu className="space-y-2">
            {SidebarNavItems.map((item, idx) => (
              <SidebarMenuItem key={item.href}>
                {/* <SidebarMenuButton asChild className="rounded-lg"> */}
                <Link href={item.href}  className="flex items-center gap-3 h-10 px-3 rounded-lg hover:bg-muted" key={idx}>
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                {/* </SidebarMenuButton> */}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-gradient-to-b from-background to-muted/20">{children}</main>
      </SidebarProvider>
    </div>
  );
}
