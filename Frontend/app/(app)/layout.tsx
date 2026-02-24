import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <TooltipProvider>
        <AppSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
}
