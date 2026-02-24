import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <SignUp />
    </div>
  )
}
