import { STEPS } from "./landing-content"
import { SectionHeading } from "./section-heading"

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-6 py-20 md:py-24 scroll-mt-16">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="How it works" title="Start practicing in three steps" />
        <ol className="gap-8 grid md:grid-cols-3">
          {STEPS.map(({ title, description }, index) => (
            <li key={title} className="relative flex flex-col items-center gap-3 text-center reveal">
              <span className="flex justify-center items-center bg-primary shadow-md rounded-full ring-4 ring-primary/15 size-12 font-bold text-primary-foreground text-lg">
                {index + 1}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className="hidden md:block top-6 left-[calc(50%+2.5rem)] absolute bg-border w-[calc(100%-5rem)] h-px"
                  aria-hidden
                />
              )}
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="max-w-xs text-muted-foreground text-sm leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
