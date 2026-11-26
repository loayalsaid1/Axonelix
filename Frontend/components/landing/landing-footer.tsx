import Link from "next/link"
import { LogoIcon } from "@/components/logo-icon"

export function LandingFooter() {
  return (
    <footer className="border-border border-t">
      <div className="flex sm:flex-row flex-col justify-between items-center gap-4 mx-auto px-6 py-8 max-w-6xl text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <LogoIcon className="size-6" />
          <span>© {new Date().getFullYear()} Axonelix. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
          <Link href="/sign-up" className="hover:text-foreground transition-colors">Sign up</Link>
        </div>
      </div>
    </footer>
  )
}
