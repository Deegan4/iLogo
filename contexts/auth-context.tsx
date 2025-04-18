"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{
    error: Error | null
  }>
  signUp: (
    email: string,
    password: string,
    userData?: { fullName?: string },
  ) => Promise<{
    error: Error | null
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: Error | null
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get session from Supabase
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
      }

      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session expiry based on "remember me" option
          // Default is 1 hour, extended is 30 days
          expiresIn: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60,
        },
      })

      return { error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, userData?: { fullName?: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.fullName || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      return { error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      return { error }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as Error }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
