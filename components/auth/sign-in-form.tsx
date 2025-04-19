"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertTriangle } from "lucide-react"
import { SocialLoginButtons } from "./social-login-buttons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usePasswordSecurity } from "@/hooks/use-password-security"

interface SignInFormProps {
  onSuccess?: () => void
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { checkPassword } = usePasswordSecurity()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setPasswordWarning(null)

    try {
      // Check if password has been compromised
      setIsCheckingPassword(true)
      const passwordCheck = await checkPassword(password)
      setIsCheckingPassword(false)

      if (passwordCheck.isPwned) {
        // Show warning but allow sign-in to continue
        setPasswordWarning(
          `Warning: This password has been found in ${passwordCheck.breachCount} data breaches. ` +
            `We recommend changing your password after signing in.`,
        )
      }

      const { error } = await signIn(email, password)

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message || "Please check your credentials and try again.",
        })
        setIsLoading(false)
        return
      }

      // Success
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later.",
      })
      console.error("Sign in error:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {passwordWarning && (
          <Alert
            variant="destructive"
            className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{passwordWarning}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || isCheckingPassword}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : isCheckingPassword ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking password...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <SocialLoginButtons />

      <div className="text-center text-sm">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
