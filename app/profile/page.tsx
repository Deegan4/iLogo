import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"

export default async function ProfilePage() {
  const supabase = createClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="bg-card rounded-lg p-6 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </div>
  )
}
