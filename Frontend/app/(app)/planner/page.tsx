import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { PlannerWorkspace } from "@/components/planner/planner-workspace"

export default function PlannerPage() {
  return (
    <>
      <header className="flex items-center gap-2 h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Planner</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col flex-1 p-4 lg:p-6 overflow-auto bg-gradient-to-br from-background via-muted/10 to-muted/20">
        <div className="mx-auto w-full max-w-8xl">
          <PlannerWorkspace />
        </div>
      </div>
    </>
  )
}
