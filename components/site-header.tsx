"use client"

import Link from "next/link"
import { useState } from "react"
import { UserMenu } from "@/components/auth/user-menu"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">iLogo</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <UserMenu onSignInClick={() => setIsAuthDialogOpen(true)} />
          </nav>
        </div>
      </div>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </header>
  )
}
