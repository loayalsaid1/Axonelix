import { LandingHeader } from "@/components/landing/landing-header"
import { HeroSection } from "@/components/landing/hero-section"
import { CurriculumSection } from "@/components/landing/curriculum-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { RoadmapSection } from "@/components/landing/roadmap-section"
import { FaqSection } from "@/components/landing/faq-section"
import { CtaSection } from "@/components/landing/cta-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-background min-h-screen scroll-smooth">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <CurriculumSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RoadmapSection />
        <FaqSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
