import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  try {
    // Create a response object that we can modify
    const res = NextResponse.next()

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Detect Safari browser
    const userAgent = req.headers.get("user-agent") || ""
    const isSafari = userAgent.includes("Safari") && !userAgent.includes("Chrome")

    // Refresh session if expired - required for Server Components
    // Add extra error handling for Safari
    try {
      await supabase.auth.getSession()
    } catch (error) {
      console.error("Error refreshing session in middleware:", error)

      // If this is a protected route and we're in Safari, handle differently
      if (isSafari && isProtectedRoute(req.nextUrl.pathname)) {
        // For Safari, redirect to sign in if session refresh fails on protected routes
        return NextResponse.redirect(new URL("/auth/signin", req.url))
      }
    }

    // Add cache control headers to prevent caching issues in Safari
    if (isSafari) {
      res.headers.set("Cache-Control", "no-store, max-age=0")
      res.headers.set("Pragma", "no-cache")
      res.headers.set("Expires", "0")
    }

    // Check if the request is for the auth page and redirect to sign-in if it's just /auth
    if (req.nextUrl.pathname === "/auth") {
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    return res
  } catch (error) {
    console.error("Unexpected error in middleware:", error)
    return NextResponse.next()
  }
}

// Helper function to determine if a route should be protected
function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ["/dashboard", "/collections", "/profile"]
  return protectedPaths.some((path) => pathname.startsWith(path))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
