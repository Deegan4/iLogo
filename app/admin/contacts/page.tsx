import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContactsList } from "@/components/admin/contacts-list"

export const metadata = {
  title: "Contact Submissions | Admin | iLogo",
  description: "Manage contact form submissions",
}

export default async function ContactsAdminPage() {
  const supabase = createClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // Check if user is an admin (you would need to implement this logic)
  // For now, we'll just allow any authenticated user to access this page

  // Fetch contacts - we need to add RLS policies for this
  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contacts:", error)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Contact Submissions</h1>
      <ContactsList initialContacts={contacts || []} />
    </div>
  )
}
