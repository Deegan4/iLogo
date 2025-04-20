"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    router.push("/")
  }

  if (isLoading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
  }

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Sign In
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-expanded={isOpen}
      >
        {user.email?.[0].toUpperCase() || "U"}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-sm text-muted-foreground">{user.email}</div>
            <div className="border-t border-border"></div>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Profile
            </Link>
            <div className="border-t border-border"></div>
            <button
              onClick={handleSignOut}
              className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
              role="menuitem"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
