import { CURRICULUM_POINTS } from "./landing-content"
import { SectionHeading } from "./section-heading"

export function CurriculumSection() {
  return (
    <section id="why" className="px-6 py-20 md:py-24 scroll-mt-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Why Axonelix"
          title="Made for your curriculum, not US boards"
          description="International question banks are written for someone else's exams. Axonelix is built from the ground up for medical schools in Egypt."
        />
        <div className="gap-10 grid md:grid-cols-3">
          {CURRICULUM_POINTS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="reveal flex flex-col items-center gap-3 text-center">
              <div className="flex justify-center items-center bg-primary shadow-md rounded-2xl size-14 text-primary-foreground">
                <Icon className="size-6" />
              </div>
              <h3 className="font-semibold text-foreground text-lg">{title}</h3>
              <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
