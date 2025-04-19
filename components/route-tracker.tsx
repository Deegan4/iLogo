"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { logNavigation } from "@/lib/route-logger"

export function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    // Enable server logging in development
    if (process.env.NODE_ENV === "development") {
      // This is imported dynamically to avoid issues with SSR
      import("@/lib/route-logger").then(({ routeLogger }) => {
        routeLogger.enableServerLogging(true)
      })
    }
  }, [])

  useEffect(() => {
    // Get the full URL including search params
    const search = searchParams?.toString()
    const fullPath = search ? `${pathname}?${search}` : pathname

    // Skip the initial render
    if (prevPathRef.current !== null) {
      logNavigation(prevPathRef.current, fullPath, {
        timestamp: new Date().toISOString(),
        clientSide: true,
      })
    }

    // Update the previous path
    prevPathRef.current = fullPath

    // Log page view
    console.log(`[Route] 📄 Page view: ${fullPath}`)
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}
