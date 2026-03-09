import { Users } from "lucide-react"
import { ComingSoon } from "@/components/coming-soon"

export default function AdminUsersPage() {
	return (
		<ComingSoon
			title="Users"
			description="Manage registered students and their access to content."
			icon={Users}
		/>
	)
}
