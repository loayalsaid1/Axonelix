import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <AdminSidebar />
        <SidebarInset className="min-w-0">
          {children}
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  )
}
