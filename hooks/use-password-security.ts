"use client"

import { useState, useEffect } from "react"

interface PasswordSecurityResult {
  isPwned: boolean
  count?: number
  message?: string
  loading: boolean
  error: string | null
}

export function usePasswordSecurity(password: string, debounceMs = 500) {
  const [result, setResult] = useState<PasswordSecurityResult>({
    isPwned: false,
    loading: false,
    error: null,
  })

  useEffect(() => {
    // Don't check empty or very short passwords
    if (!password || password.length < 4) {
      setResult({
        isPwned: false,
        loading: false,
        error: null,
      })
      return
    }

    // Set loading state
    setResult((prev) => ({ ...prev, loading: true }))

    // Debounce the API call
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/check-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        })

        if (!response.ok) {
          throw new Error("Failed to check password security")
        }

        const data = await response.json()

        setResult({
          isPwned: data.isPwned,
          count: data.count,
          message: data.message,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Error checking password:", error)
        setResult({
          isPwned: false,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }, debounceMs)

    // Clean up the timer
    return () => clearTimeout(timer)
  }, [password, debounceMs])

  return result
}
