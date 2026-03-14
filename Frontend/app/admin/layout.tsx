import { redirect } from 'next/navigation'
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { getCurrentUser } from '@/lib/api/users'
import { Role } from '@/lib/types'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || user.role !== Role.Admin) {
    redirect('/')
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </SidebarInset>
    </SidebarProvider>
  )
}
