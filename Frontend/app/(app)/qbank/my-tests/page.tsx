import { ComingSoon } from "@/components/coming-soon"
import { ClipboardList } from "lucide-react"

export default function MyTestsPage() {
  return (
    <ComingSoon
      title="My Tests"
      description="All the tests you've taken or saved will live here. Review past attempts and track your progress."
      icon={ClipboardList}
    />
  )
}
