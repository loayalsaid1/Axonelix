import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQS } from "./landing-content"
import { SectionHeading } from "./section-heading"

export function FaqSection() {
  return (
    <section id="faq" className="px-6 py-20 md:py-24 scroll-mt-16">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <Accordion type="single" collapsible className="w-full reveal">
          {FAQS.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="text-base">{question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
