"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)

  useEffect(() => {
    setError(searchParams.get("error"))
    setDescription(searchParams.get("description"))
  }, [searchParams])

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>There was a problem with the authentication process.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-4 rounded-md bg-destructive/10">
                <p className="font-medium">Error: {error}</p>
                {description && <p className="text-sm mt-2">{description}</p>}
              </div>
            )}
            <div className="text-sm">
              <p>This could be due to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>An expired verification link</li>
                <li>Browser cookie or privacy settings</li>
                <li>Network connectivity issues</li>
                <li>Safari-specific authentication limitations</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Signing In Again</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
