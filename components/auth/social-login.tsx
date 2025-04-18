"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Mail } from "lucide-react"

export function SocialLogin() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSocialLogin = async (provider: "github" | "google" | "twitter") => {
    try {
      setIsLoading(provider)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: `There was an error signing in with ${provider}. Please try again.`,
      })
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => handleSocialLogin("github")} disabled={!!isLoading} className="w-full">
          {isLoading === "github" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Github className="h-4 w-4" />
          )}
          <span className="sr-only">GitHub</span>
        </Button>

        <Button variant="outline" onClick={() => handleSocialLogin("google")} disabled={!!isLoading} className="w-full">
          {isLoading === "google" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          <span className="sr-only">Google</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin("twitter")}
          disabled={!!isLoading}
          className="w-full"
        >
          {isLoading === "twitter" ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Twitter className="h-4 w-4" />
          )}
          <span className="sr-only">Twitter</span>
        </Button>
      </div>
    </div>
  )
}
