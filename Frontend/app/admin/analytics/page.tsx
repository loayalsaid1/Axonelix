import { TrendingUp } from "lucide-react"
import { ComingSoon } from "@/components/coming-soon"

export default function AdminAnalyticsPage() {
	return (
		<ComingSoon
			title="Analytics"
			description="Insights and performance metrics across your content and users."
			icon={TrendingUp}
		/>
	)
}
