"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { useAuth } from "./auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Github, Chrome, Twitter, Linkedin } from "lucide-react"

interface SocialLoginButtonsProps {
  onSuccess?: () => void
}

export function SocialLoginButtons({ onSuccess }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { signInWithProvider } = useAuth()
  const { toast } = useToast()

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signInWithProvider(provider)
      toast({
        title: "Sign in successful",
        description: `You've successfully signed in with ${provider}`,
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: `Could not sign in with ${provider}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("google")}
        disabled={!!isLoading}
        isLoading={isLoading === "google"}
      >
        {isLoading !== "google" && <Chrome className="mr-2 h-4 w-4" />}
        Google
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("github")}
        disabled={!!isLoading}
        isLoading={isLoading === "github"}
      >
        {isLoading !== "github" && <Github className="mr-2 h-4 w-4" />}
        GitHub
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("twitter")}
        disabled={!!isLoading}
        isLoading={isLoading === "twitter"}
      >
        {isLoading !== "twitter" && <Twitter className="mr-2 h-4 w-4" />}
        Twitter
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("linkedin")}
        disabled={!!isLoading}
        isLoading={isLoading === "linkedin"}
      >
        {isLoading !== "linkedin" && <Linkedin className="mr-2 h-4 w-4" />}
        LinkedIn
      </Button>
    </div>
  )
}
