"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User, Session, AuthError } from "@supabase/supabase-js"

// Define the plan type
export type PlanType = "free" | "basic" | "pro" | "enterprise"

// Define the authentication context type
type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  plan: PlanType
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updateUser: (attributes: { [key: string]: any }) => Promise<{ error: AuthError | null }>
  setAuthError: (error: string | null) => void
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create the authentication provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<PlanType>("free")
  const router = useRouter()
  const supabase = createClient()

  // Detect Safari browser
  const isSafari = typeof window !== "undefined" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  // Initialize the auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)

        // Get the current session
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          // Handle Safari-specific session errors
          if (isSafari) {
            console.log("Safari detected, handling session differently")
          }
        }

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Fetch user's plan (in a real app, this would come from your database)
          // For now, we'll just set it to "free"
          setPlan("free")
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up the auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)

      // Refresh the page data when auth state changes
      router.refresh()
    })

    // Clean up the subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, isSafari])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // Special handling for Safari
      if (isSafari && !error) {
        // Force a page refresh after successful sign-in on Safari
        window.location.href = "/dashboard"
      }

      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as AuthError }
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      // Get the current site URL for the redirect
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
          data: metadata,
        },
      })

      return { error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as AuthError }
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      })

      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as AuthError }
    }
  }

  // Update user function
  const updateUser = async (attributes: { [key: string]: any }) => {
    try {
      const { error } = await supabase.auth.updateUser(attributes)
      return { error }
    } catch (error) {
      console.error("Update user error:", error)
      return { error: error as AuthError }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()

      // Special handling for Safari
      if (isSafari) {
        // Force a page refresh after sign-out on Safari
        window.location.href = "/"
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  // Set auth error function
  const setAuthError = (error: string | null) => {
    setError(error)
  }

  // Create the context value
  const value = {
    user,
    session,
    isLoading,
    error,
    plan,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    setAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
