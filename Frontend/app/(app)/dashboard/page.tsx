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
import {
  TrendingUp,
  BookOpen,
  FileQuestion,
  CalendarDays,
  CreditCard,
  Flame,
  Target,
  Clock,
} from "lucide-react"

const statCards = [
  {
    label: "Questions Answered",
    value: "—",
    icon: FileQuestion,
    hint: "Start a test to track your progress",
  },
  {
    label: "Study Streak",
    value: "—",
    icon: Flame,
    hint: "Log in daily to build your streak",
  },
  {
    label: "Avg. Score",
    value: "—",
    icon: Target,
    hint: "Complete at least one test to see results",
  },
  {
    label: "Study Time",
    value: "—",
    icon: Clock,
    hint: "Time spent studying this week",
  },
]

const quickLinks = [
  { label: "Library", href: "/library", icon: BookOpen, desc: "Browse materials" },
  { label: "QBank", href: "/qbank", icon: FileQuestion, desc: "Practice questions" },
  { label: "Flashcards", href: "/flashcards", icon: CreditCard, desc: "Active recall" },
  { label: "Planner", href: "/planner", icon: CalendarDays, desc: "Study schedule" },
  { label: "Performance", href: "/performance", icon: TrendingUp, desc: "Track progress" },
]

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
        <div className="gap-4 grid grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, hint }) => (
            <Card key={label} className="gap-3 py-4">
              <CardHeader className="flex-row justify-between items-center gap-2 space-y-0 px-4 pt-0 pb-0">
                <CardTitle className="font-medium text-muted-foreground text-xs">{label}</CardTitle>
                <div className="flex justify-center items-center bg-muted rounded-md w-7 h-7 shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 px-4">
                <span className="font-bold text-foreground text-2xl">{value}</span>
                <span className="text-muted-foreground/70 text-xs leading-snug">{hint}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content area */}
        <div className="gap-4 grid md:grid-cols-3">
          {/* Recent activity placeholder */}
          <Card className="gap-4 md:col-span-2 py-4">
            <CardHeader className="flex-row justify-between items-center space-y-0 px-5 pt-0 pb-0">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-0 px-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-border/40 last:border-0 border-b">
                  <div className="bg-muted rounded-md w-8 h-8 shrink-0" />
                  <div className="flex flex-col flex-1 gap-1.5">
                    <div className="bg-muted rounded w-2/3 h-3" />
                    <div className="bg-muted/60 rounded w-1/3 h-2.5" />
                  </div>
                  <div className="bg-muted rounded w-12 h-2.5 shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card className="gap-4 py-4">
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
