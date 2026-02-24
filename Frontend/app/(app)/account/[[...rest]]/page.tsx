import { UserProfile } from '@clerk/nextjs'

export default function AccountPage() {
  return (
    <div className="flex flex-col justify-center items-center bg-zinc-50 dark:bg-zinc-950 p-8 min-h-screen">
      <UserProfile
        path="/account"
        routing="path"
      />
    </div>
  )
}
