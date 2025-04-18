import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CollectionView } from "@/components/collections/collection-view"
import type { Database } from "@/lib/database.types"

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // Get collection
  const { data: collection } = await supabase
    .from("logo_collections")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  if (!collection) {
    redirect("/dashboard")
  }

  // Get logos in this collection
  const { data: collectionItems } = await supabase
    .from("logo_collection_items")
    .select("logo_id")
    .eq("collection_id", params.id)

  const logoIds = collectionItems?.map((item) => item.logo_id) || []

  let logos: Database["public"]["Tables"]["logos"]["Row"][] = []

  if (logoIds.length > 0) {
    const { data } = await supabase
      .from("logos")
      .select("*")
      .in("id", logoIds)
      .order("created_at", { ascending: false })

    logos = data || []
  }

  return (
    <div className="container mx-auto py-10">
      <CollectionView collection={collection} logos={logos} />
    </div>
  )
}
