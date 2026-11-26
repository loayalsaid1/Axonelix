import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/maintenance',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

const clerk = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

const isMaintenanceMode =
  process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1'

const isMaintenanceAllowed = createRouteMatcher(['/', '/maintenance'])

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (isMaintenanceMode && !isMaintenanceAllowed(request)) {
    if (request.nextUrl.pathname.startsWith('/api/') || request.nextUrl.pathname.startsWith('/trpc')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable for maintenance' },
        { status: 503, headers: { 'Retry-After': '3600' } }
      )
    }
    return NextResponse.rewrite(new URL('/maintenance', request.url))
  }

  return clerk(request, event)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
