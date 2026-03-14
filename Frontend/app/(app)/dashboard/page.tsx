import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Suspense } from "react"
import Link from "next/link"
import {
  TrendingUp,
  BookOpen,
  FileQuestion,
  CalendarDays,
  CreditCard,
  Zap,
} from "lucide-react"
import { RecentTestsCard, RecentTestsCardSkeleton } from "@/components/dashboard/RecentTestsCard"
import { DashboardStats, DashboardStatsSkeleton } from "@/components/dashboard/DashboardStats"

const quickLinks = [
  { label: "Library", href: "/library", icon: BookOpen, desc: "Browse materials" },
  { label: "QBank", href: "/qbank", icon: FileQuestion, desc: "Practice questions" },
  { label: "Flashcards", href: "/flashcards", icon: CreditCard, desc: "Active recall" },
  { label: "Planner", href: "/planner", icon: CalendarDays, desc: "Study schedule" },
  { label: "Performance", href: "/performance", icon: TrendingUp, desc: "Track progress" },
]

const GenerateTestCard = () => (
  <Link href="/qbank/generate-tests" className="group min-w-0">
    <Card className="gap-3 border-primary/20 hover:border-primary/50 py-4 h-full min-w-0 transition-all cursor-pointer hover:shadow-md">
      <CardHeader className="flex-row justify-between items-center gap-2 space-y-0 px-4 pt-0 pb-0">
        <CardTitle className="font-medium text-muted-foreground text-xs">Custom Quiz</CardTitle>
        <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary/20 rounded-md w-7 h-7 transition-colors shrink-0">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-4">
        <span className="font-bold text-foreground group-hover:text-primary text-2xl transition-colors">Generate</span>
        <span className="text-muted-foreground/70 text-xs leading-snug">Build a custom quiz session from any topic</span>
      </CardContent>
    </Card>
  </Link>
)

export default function DashboardPage() {
  return (
    <>
      <header className="flex items-center gap-2 h-16 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 transition-[width,height] ease-linear shrink-0">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6 pt-2">
        {/* Welcome */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-foreground text-lg leading-tight">Welcome back 👋</h1>
            <p className="text-muted-foreground text-sm">Here&apos;s an overview of your study activity.</p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">Preview</Badge>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
          <Suspense fallback={<DashboardStatsSkeleton />}>
            <DashboardStats />
          </Suspense>
          <GenerateTestCard />
        </div>

        {/* Main content area */}
        <div className="grid md:grid-cols-3 gap-4 min-w-0">
          {/* Recent tests — streams in while the rest of the page renders */}
          <Suspense fallback={<RecentTestsCardSkeleton />}>
            <RecentTestsCard />
          </Suspense>

          {/* Quick links */}
          <Card className="col-span-1 gap-4 py-4 min-w-0">
            <CardHeader className="space-y-0 px-5 pt-0 pb-0">
              <CardTitle className="text-sm">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="px-3">
              <nav className="flex flex-col gap-1">
                {quickLinks.map(({ label, href, icon: Icon, desc }) => (
                  <a
                    key={label}
                    href={href}
                    className="group flex items-center gap-3 hover:bg-muted/60 px-2 py-2 rounded-lg transition-colors"
                  >
                    <div className="flex justify-center items-center bg-muted group-hover:bg-primary/10 rounded-md w-8 h-8 transition-colors shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground text-xs">{label}</span>
                      <span className="text-muted-foreground/70 text-xs">{desc}</span>
                    </div>
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
