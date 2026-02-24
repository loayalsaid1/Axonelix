import { UserProfile } from '@clerk/nextjs'

export default function AccountPage() {
  return (
    <div className="flex flex-col justify-center items-center bg-background p-8 min-h-screen">
      <div className="w-full max-w-3xl">
        <UserProfile path="/account" routing="path" />
      </div>
    </div>
  )
}
