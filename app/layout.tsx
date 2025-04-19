import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { Suspense } from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ScrollToTop } from "@/components/scroll-to-top"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { RouteTracker } from "@/components/route-tracker"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "iLogo - AI Logo Generator",
  description: "Create beautiful logos with AI",
  applicationName: "iLogo",
  authors: [{ name: "iLogo Team" }],
  keywords: ["logo", "ai", "generator", "design", "branding"],
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Suspense>
              {/* Add the RouteTracker component */}
              <RouteTracker />
              <SiteHeader demoMode={false} setDemoMode={() => {}} />
              <main className="min-h-screen pt-16">{children}</main>
              <SiteFooter />
            </Suspense>
            <ScrollToTop />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
