import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ForgotPasswordPage() {
  // Check if user is already signed in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there is a session, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <ForgotPasswordForm />
}
