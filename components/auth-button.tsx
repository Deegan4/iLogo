"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button-custom"
import { AuthDialog } from "@/components/auth/auth-dialog"

interface AuthButtonProps {
  variant?: "default" | "outline" | "auth" | "auth-secondary"
  size?: "default" | "sm" | "lg"
  className?: string
  defaultTab?: "sign-in" | "sign-up"
}

export function AuthButton({
  variant = "default",
  size = "default",
  className,
  defaultTab = "sign-in",
}: AuthButtonProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useAuth()

  if (user) {
    return null
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setShowAuthDialog(true)}>
        Sign In
      </Button>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} defaultTab={defaultTab} />
    </>
  )
}
