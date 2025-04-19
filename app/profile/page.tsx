import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Profile | iLogo",
  description: "Manage your profile",
}

export default async function ProfilePage() {
  const supabase = createClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/auth/signin")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and manage your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Email</h3>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
              {profile && (
                <>
                  {profile.full_name && (
                    <div>
                      <h3 className="text-sm font-medium">Full Name</h3>
                      <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                    </div>
                  )}
                  {profile.username && (
                    <div>
                      <h3 className="text-sm font-medium">Username</h3>
                      <p className="text-sm text-muted-foreground">{profile.username}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
