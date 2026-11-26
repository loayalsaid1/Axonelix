import { Badge } from "@/components/ui/badge"
import { FEATURES } from "./landing-content"
import { SectionHeading } from "./section-heading"

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/50 px-6 py-20 md:py-24 border-border border-y scroll-mt-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Features"
          title="Everything for your modules, in one place"
          description="From your first lesson to your final exam: practice the questions that matter, then learn from every answer."
        />
        <div className="gap-6 grid sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description, status }) => (
            <div
              key={title}
              className="group reveal flex flex-col gap-3 bg-card shadow-sm hover:shadow-md p-6 border border-border hover:border-primary/40 rounded-2xl transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex justify-center items-center bg-primary/10 group-hover:bg-primary rounded-xl size-11 text-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="size-5" />
                </div>
                {status && (
                  <Badge variant="outline" className="gap-1.5">
                    <span className="bg-primary rounded-full size-1.5 animate-pulse" aria-hidden />
                    {status}
                  </Badge>
                )}
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
