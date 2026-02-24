import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ComingSoon } from "@/components/coming-soon"
import { CreditCard } from "lucide-react"

export default function FlashcardsPage() {
  return (
    <>
      <header className="flex items-center gap-2 h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Flashcards</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-col flex-1 p-4 pt-0">
        <ComingSoon
          title="Flashcards"
          description="Create and review smart flashcard decks to reinforce your knowledge through active recall."
          icon={CreditCard}
        />
      </div>
    </>
  )
}
