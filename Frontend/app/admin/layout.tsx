import { redirect } from 'next/navigation'
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getCurrentUser } from '@/lib/api/users'
import { Role } from '@/lib/types'
import { Separator } from '@/components/ui/separator'

interface AdminLayoutProps {
  children: React.ReactNode
  modal?: React.ReactNode
}

export default async function AdminLayout({ children, modal }: AdminLayoutProps) {
  const user = await getCurrentUser()

  if (!user || user.role !== Role.Admin) {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <TooltipProvider>
          {children}
          {modal}
        </TooltipProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
