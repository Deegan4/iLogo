import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  const isAuthRoute = req.nextUrl.pathname.startsWith("/auth")
  const isApiRoute = req.nextUrl.pathname.startsWith("/api")
  const isPublicRoute =
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname.startsWith("/blog") ||
    req.nextUrl.pathname.startsWith("/about")

  // If user is signed in and trying to access auth page, redirect to dashboard
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If user is not signed in and trying to access protected page, redirect to sign in
  if (!session && !isAuthRoute && !isPublicRoute && !isApiRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
