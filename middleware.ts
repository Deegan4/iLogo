import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Process the response
  const response = NextResponse.next()

  // Ensure proper content type for API responses
  response.headers.set("Content-Type", "application/json")

  return response
}

export const config = {
  matcher: "/api/:path*",
}
