import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function VerificationSentPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent you a verification link. Please check your email to verify your account.
        </p>
      </div>

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/auth/signin">Return to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
