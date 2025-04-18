"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button-custom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"

interface UserMenuProps {
  onSignInClick: () => void
}

export function UserMenu({ onSignInClick }: UserMenuProps) {
  const { user, signOut, isLoading } = useAuth()

  if (!user) {
    return (
      <Button variant="outline" onClick={onSignInClick}>
        Sign In
      </Button>
    )
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email.substring(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {user.image ? (
              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.email} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            {user.image ? (
              <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.email} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.provider && (
              <p className="text-xs text-muted-foreground">
                Signed in with {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} disabled={isLoading}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
