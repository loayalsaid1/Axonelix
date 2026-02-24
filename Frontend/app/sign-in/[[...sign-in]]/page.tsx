import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <SignIn />
    </div>
  )
}
