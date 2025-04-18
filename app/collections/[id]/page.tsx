import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CollectionView } from "@/components/collections/collection-view"

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/signin")
  }

  // Get collection - RLS will ensure the user can only see their own collection
  const { data: collection, error: collectionError } = await supabase
    .from("logo_collections")
    .select("*")
    .eq("id", params.id)
    .single()

  if (collectionError || !collection) {
    redirect("/dashboard")
  }

  // Get logos in this collection - RLS will ensure the user can only see their own collection items
  const { data: collectionItems, error: itemsError } = await supabase
    .from("logo_collection_items")
    .select("logo_id")
    .eq("collection_id", params.id)

  if (itemsError) {
    console.error("Error fetching collection items:", itemsError)
  }

  const logoIds = collectionItems?.map((item) => item.logo_id) || []

  let logos = []
  if (logoIds.length > 0) {
    // Get the actual logos - RLS will ensure the user can only see their own logos
    const { data: logosData, error: logosError } = await supabase
      .from("logos")
      .select("*")
      .in("id", logoIds)
      .order("created_at", { ascending: false })

    if (logosError) {
      console.error("Error fetching logos:", logosError)
    }

    logos = logosData || []
  }

  return (
    <div className="container mx-auto py-10">
      <CollectionView collection={collection} logos={logos} />
    </div>
  )
}
