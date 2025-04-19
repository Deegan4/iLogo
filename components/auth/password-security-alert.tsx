"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button-custom"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function PasswordSecurityAlert() {
  const [showAlert, setShowAlert] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  // This is a placeholder - in a real implementation, you would check if the user's password
  // has been compromised by calling your API endpoint
  useEffect(() => {
    // For demo purposes, we'll just show the alert sometimes
    // In a real implementation, you would check the user's password against HIBP
    const checkPasswordSecurity = async () => {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll just show the alert 30% of the time
      if (Math.random() < 0.3) {
        setShowAlert(true)
      }
    }

    if (user) {
      checkPasswordSecurity()
    }
  }, [user])

  const validatePassword = (password: string): boolean => {
    // Reset previous error
    setPasswordError(null)

    // Check password length
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return false
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setPasswordError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
      return false
    }

    return true
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setPasswordError(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (!validatePassword(newPassword)) {
      setIsLoading(false)
      return
    }

    try {
      // In a real implementation, you would call Supabase to update the password
      // For demo purposes, we'll just simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      setIsDialogOpen(false)
      setShowAlert(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        variant: "destructive",
        title: "Error updating password",
        description: "Please check your current password and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!showAlert) {
    return null
  }

  return (
    <>
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Your password has been found in a data breach. Please change it immediately for your security.</span>
          <Button variant="destructive" size="sm" onClick={() => setIsDialogOpen(true)}>
            Change Password
          </Button>
        </AlertDescription>
      </Alert>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Your Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (passwordError) setPasswordError(null)
                }}
                required
                disabled={isLoading}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
