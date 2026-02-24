import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center bg-background min-h-screen">
      <div className="p-6 w-full max-w-md">
        <SignUp />
      </div>
    </div>
  )
}
