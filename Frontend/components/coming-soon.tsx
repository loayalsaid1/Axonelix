import { type LucideIcon, Construction } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

interface ComingSoonProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function ComingSoon({
  title,
  description,
  icon: Icon = Construction,
}: ComingSoonProps) {
  return (
    <Empty className="flex-1 border-dashed min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted mb-3 rounded-xl size-14 [&_svg]:size-7 text-primary"
        >
          <Icon strokeWidth={1.5} />
        </EmptyMedia>
        <div className="flex items-center gap-2">
          <EmptyTitle>{title}</EmptyTitle>
          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
        </div>
        <EmptyDescription>
          {description ??
            "This feature is currently under development. Check back soon — it'll be worth the wait."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
