import Link from "next/link"
import { Button } from "@/components/ui/button-custom"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to iLogo</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
        Create beautiful logos with AI. Get started by exploring our features.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
