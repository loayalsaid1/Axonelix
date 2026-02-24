import { ComingSoon } from "@/components/coming-soon"
import { Sparkles } from "lucide-react"

export default function GenerateTestsPage() {
  return (
    <ComingSoon
      title="Generate Tests"
      description="Let AI build a custom test for you, tailored to the topics, difficulty, and format you choose."
      icon={Sparkles}
    />
  )
}
