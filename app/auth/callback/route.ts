import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const error_description = requestUrl.searchParams.get("error_description")

    // Log authentication errors
    if (error) {
      console.error(`Auth error: ${error}`, error_description)
      // Redirect to error page with information
      return NextResponse.redirect(new URL(`/auth/error?error=${error}&description=${error_description}`, request.url))
    }

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

      // Set SameSite and Secure attributes for Safari compatibility
      const response = NextResponse.redirect(new URL("/dashboard", request.url))

      try {
        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code)

        // Add cache control headers to prevent caching issues in Safari
        response.headers.set("Cache-Control", "no-store, max-age=0")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")

        return response
      } catch (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError)
        // Redirect to error page with information
        return NextResponse.redirect(
          new URL(
            `/auth/error?error=exchange_failed&description=${encodeURIComponent(String(exchangeError))}`,
            request.url,
          ),
        )
      }
    }

    // If no code is present, redirect to sign in
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    return NextResponse.redirect(new URL("/auth/error", request.url))
  }
}
