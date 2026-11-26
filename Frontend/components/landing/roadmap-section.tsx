import { Badge } from "@/components/ui/badge"
import { ROADMAP } from "./landing-content"
import { SectionHeading } from "./section-heading"

export function RoadmapSection() {
  return (
    <section id="whats-next" className="bg-muted/50 px-6 py-20 md:py-24 border-border border-y scroll-mt-16">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="What's next"
          title="Growing with every module"
          description="Axonelix is actively expanding. Here's what's on the way."
        />
        <div className="gap-6 grid md:grid-cols-2">
          {ROADMAP.map(({ icon: Icon, title, status, description }) => (
            <div
              key={title}
              className="reveal flex flex-col gap-3 bg-card/60 p-6 border border-border border-dashed rounded-2xl"
            >
              <div className="flex justify-between items-center">
                <div className="flex justify-center items-center bg-muted rounded-xl size-11 text-primary">
                  <Icon className="size-5" />
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <span className="bg-primary rounded-full size-1.5 animate-pulse" aria-hidden />
                  {status}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
