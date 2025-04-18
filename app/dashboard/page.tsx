import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
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

  // Get user's logos
  const { data: logos } = await supabase
    .from("logos")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  // Get user's collections
  const { data: collections } = await supabase
    .from("logo_collections")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <DashboardContent profile={profile} logos={logos || []} collections={collections || []} />
    </div>
  )
}
