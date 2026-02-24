import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center bg-background min-h-screen">
      <div className="p-6 w-full max-w-md">
        <SignIn />
      </div>
    </div>
  )
}
