"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { PasswordStrengthChecker } from "./password-strength-checker"

interface SignUpFormProps {
  onSuccess?: () => void
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handlePasswordValidationChange = (isValid: boolean, message?: string) => {
    setIsPasswordValid(isValid)
    setPasswordError(message || null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords do not match",
        description: "Please make sure your passwords match.",
      })
      setIsLoading(false)
      return
    }

    // Check if password is valid according to our strength checker
    if (!isPasswordValid) {
      toast({
        variant: "destructive",
        title: "Password is not secure enough",
        description: passwordError || "Please choose a stronger password.",
      })
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email, password, { fullName })

      if (error) {
        // Check for compromised password error from Supabase
        if (
          error.message?.includes("been pwned") ||
          error.message?.includes("compromised") ||
          error.message?.includes("breach")
        ) {
          setPasswordError(
            "This password has been found in a data breach. Please choose a different password for your security.",
          )
          toast({
            variant: "destructive",
            title: "Compromised password",
            description: "Please choose a different password for your security.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: error.message || "Please check your information and try again.",
          })
        }
        setIsLoading(false)
        return
      }

      // Success
      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      })

      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to sign-in page or confirmation page
        router.push("/auth/verification-sent")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Please try again later.",
      })
      console.error("Sign up error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {/* Password strength checker */}
          {password.length > 0 && (
            <PasswordStrengthChecker password={password} onValidationChange={handlePasswordValidationChange} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
