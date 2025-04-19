import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { PasswordSecurityAlert } from "@/components/auth/password-security-alert"

export default async function DashboardPage() {
  // Get session outside the try-catch block
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Handle authentication check before any other logic
  if (!session) {
    // This redirect will be properly handled by Next.js
    redirect("/auth/signin")
  }

  try {
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

        {/* Password security alert */}
        <PasswordSecurityAlert />

        <DashboardTabs
          logos={logos || []}
          collections={collections || []}
          generationHistory={generationHistory || []}
        />
      </div>
    )
  } catch (error) {
    console.error("Data fetching error:", error)

    // Return a fallback UI with error message
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error loading dashboard: </strong>
          <span className="block sm:inline">
            We encountered an issue loading your data. Please try refreshing the page or sign out and sign in again.
          </span>
        </div>
      </div>
    )
  }
}
