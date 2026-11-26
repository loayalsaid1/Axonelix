import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 mx-auto mb-12 max-w-2xl text-center", className)}>
      <span className="font-semibold text-primary text-xs uppercase tracking-widest">{eyebrow}</span>
      <h2 className="font-semibold text-foreground text-3xl md:text-4xl tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground leading-relaxed">{description}</p>}
    </div>
  )
}
