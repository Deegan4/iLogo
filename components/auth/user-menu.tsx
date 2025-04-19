"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button-custom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, LogOut, Settings, User, Grid, FolderOpen, Crown } from "lucide-react"
import { AuthDialog } from "@/components/auth/auth-dialog"

export function UserMenu() {
  const { user, signOut, isLoading, plan } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut()
      // Router navigation is handled in the signOut function
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled className="relative h-8 w-8 rounded-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    )
  }

  // Show sign in button if not authenticated
  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setShowAuthDialog(true)}>
          Sign In
        </Button>
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} defaultTab="sign-in" />
      </>
    )
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  // Get plan display name
  const getPlanName = () => {
    switch (plan) {
      case "pro":
        return "Pro"
      case "enterprise":
        return "Enterprise"
      default:
        return "Free"
    }
  }

  // Show user menu if authenticated
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground flex items-center">
              <Crown className="h-3 w-3 text-primary mr-1" />
              {getPlanName()} Plan
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center cursor-pointer">
              <Grid className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/collections" className="flex items-center cursor-pointer">
              <FolderOpen className="mr-2 h-4 w-4" />
              <span>Collections</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isSigningOut}
          onClick={handleSignOut}
        >
          {isSigningOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
