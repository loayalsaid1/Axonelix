import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoIcon } from "@/components/logo-icon"
import { NAV_LINKS } from "./landing-content"

export function LandingHeader() {
  return (
    <header className="top-0 z-50 sticky bg-background/80 backdrop-blur border-border border-b">
      <div className="flex justify-between items-center mx-auto px-6 max-w-6xl h-16">
        <Link href="/" className="flex items-center gap-2">
          <LogoIcon className="size-8" />
          <span className="font-semibold text-lg tracking-tight">Axonelix</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-muted-foreground text-sm">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href} className="hover:text-foreground transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">
              Get started <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
