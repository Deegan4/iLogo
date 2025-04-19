"use client"

import { usePasswordSecurity } from "@/hooks/use-password-security"
import { AlertTriangle, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PasswordStrengthCheckerProps {
  password: string
  className?: string
}

export function PasswordStrengthChecker({ password, className }: PasswordStrengthCheckerProps) {
  const { isPwned, loading, error } = usePasswordSecurity(password)

  // Calculate password strength
  const getStrength = (password: string): number => {
    if (!password) return 0

    let strength = 0

    // Length check
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    // Penalize for compromised password
    if (isPwned) strength = Math.max(0, strength - 3)

    return Math.min(5, strength)
  }

  const strength = getStrength(password)

  // Get strength label and color
  const getStrengthInfo = (strength: number) => {
    if (isPwned) return { label: "Compromised", color: "bg-red-500" }

    switch (strength) {
      case 0:
        return { label: "Very Weak", color: "bg-red-500" }
      case 1:
        return { label: "Weak", color: "bg-red-400" }
      case 2:
        return { label: "Fair", color: "bg-yellow-500" }
      case 3:
        return { label: "Good", color: "bg-yellow-400" }
      case 4:
        return { label: "Strong", color: "bg-green-400" }
      case 5:
        return { label: "Very Strong", color: "bg-green-500" }
      default:
        return { label: "Unknown", color: "bg-gray-400" }
    }
  }

  const { label, color } = getStrengthInfo(strength)

  if (!password) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-1 h-1.5">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-full flex-1 rounded-full transition-colors",
              i < strength ? color : "bg-gray-200 dark:bg-gray-700",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
          ) : isPwned ? (
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          ) : strength >= 3 ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
          )}

          <span
            className={cn(
              "text-xs font-medium",
              isPwned ? "text-red-500" : strength >= 3 ? "text-green-500" : "text-yellow-500",
            )}
          >
            {loading ? "Checking..." : label}
          </span>
        </div>

        {isPwned && <span className="text-xs text-red-500">Found in data breach!</span>}
      </div>
    </div>
  )
}
