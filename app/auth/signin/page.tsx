import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SignInForm } from "@/components/auth/sign-in-form"

export default async function SignInPage() {
  // Check if user is already signed in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there is a session, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <SignInForm />
    </div>
  )
}
