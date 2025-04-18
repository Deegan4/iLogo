import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"

export default async function DashboardPage() {
  const supabase = createClient()

  // Get session - this is required for RLS to work properly
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/auth/signin")
  }

  // Fetch user's logos - RLS will automatically filter to only show the user's logos
  const { data: logos, error: logosError } = await supabase
    .from("logos")
    .select("*")
    .order("created_at", { ascending: false })

  if (logosError) {
    console.error("Error fetching logos:", logosError)
  }

  // Fetch user's collections - RLS will automatically filter to only show the user's collections
  const { data: collections, error: collectionsError } = await supabase
    .from("logo_collections")
    .select("*")
    .order("created_at", { ascending: false })

  if (collectionsError) {
    console.error("Error fetching collections:", collectionsError)
  }

  // Fetch user's generation history - RLS will automatically filter to only show the user's history
  const { data: generationHistory, error: historyError } = await supabase
    .from("logo_generation_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  if (historyError) {
    console.error("Error fetching generation history:", historyError)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {session.user.email}. Here are your logos and collections.
      </p>

      <DashboardTabs logos={logos || []} collections={collections || []} generationHistory={generationHistory || []} />
    </div>
  )
}
