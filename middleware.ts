import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Enable debug mode for detailed logging
const DEBUG_ROUTING = process.env.NODE_ENV === "development" || process.env.DEBUG_ROUTING === "true"

export async function middleware(req: NextRequest) {
  try {
    const startTime = Date.now()
    const pathname = req.nextUrl.pathname

    // Log the incoming request
    if (DEBUG_ROUTING) {
      console.log(`[Route] 🔍 Request: ${req.method} ${pathname}`)
      console.log(`[Route] 📌 Referrer: ${req.headers.get("referer") || "direct"}`)
      console.log(`[Route] 🌐 User-Agent: ${req.headers.get("user-agent")}`)
    }

    // Create a response object that we can modify
    const res = NextResponse.next()

    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient({ req, res })

    // Detect Safari browser
    const userAgent = req.headers.get("user-agent") || ""
    const isSafari = userAgent.includes("Safari") && !userAgent.includes("Chrome")

    if (DEBUG_ROUTING && isSafari) {
      console.log(`[Route] 🧭 Safari browser detected`)
    }

    // Refresh session if expired - required for Server Components
    // Add extra error handling for Safari
    try {
      const { data } = await supabase.auth.getSession()

      if (DEBUG_ROUTING) {
        console.log(`[Route] 🔐 Auth: ${data.session ? "Authenticated" : "Unauthenticated"}`)
      }
    } catch (error) {
      console.error("[Route] ❌ Error refreshing session in middleware:", error)

      // If this is a protected route and we're in Safari, handle differently
      if (isSafari && isProtectedRoute(pathname)) {
        console.log(`[Route] 🔄 Redirecting to /auth/signin (Safari + protected route)`)
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
    if (pathname === "/auth") {
      if (DEBUG_ROUTING) {
        console.log(`[Route] 🔄 Redirecting /auth to /auth/signin`)
      }
      return NextResponse.redirect(new URL("/auth/signin", req.url))
    }

    // Log protected routes
    if (DEBUG_ROUTING && isProtectedRoute(pathname)) {
      console.log(`[Route] 🔒 Protected route: ${pathname}`)
    }

    // Log the response time
    if (DEBUG_ROUTING) {
      const duration = Date.now() - startTime
      console.log(`[Route] ⏱️ Middleware processed in ${duration}ms`)
    }

    return res
  } catch (error) {
    console.error("[Route] 💥 Unexpected error in middleware:", error)
    return NextResponse.next()
  }
}

// Helper function to determine if a route should be protected
function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = ["/dashboard", "/collections", "/profile"]
  // Check if the path exactly matches or starts with one of the protected paths
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (DEBUG_ROUTING && isProtected) {
    console.log(`[Route] 🔒 Route ${pathname} is protected`)
  }

  return isProtected
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
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css)$).*)",
  ],
}
