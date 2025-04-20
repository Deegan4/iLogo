import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// Import the safe JSON utilities
import { safeJsonStringify } from "@/lib/json-utils"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    console.log("Collections API route called")

    // Verify authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 })
    }

    console.log("Fetching collections for user:", session.user.id)

    // First, check if the tables exist by running a simple query
    try {
      // Simple query to check if the logo_collections table exists and is accessible
      const { data: testData, error: testError } = await supabase.from("logo_collections").select("id").limit(1)

      if (testError) {
        console.error("Test query error:", testError)

        // If the error is related to the table not existing, we'll return a more specific error
        if (testError.message.includes("relation") && testError.message.includes("does not exist")) {
          return NextResponse.json(
            {
              error: "Collections table not found",
              details: "The logo_collections table does not exist. Please run the setup SQL script first.",
            },
            { status: 404 },
          )
        }

        return NextResponse.json(
          {
            error: "Database error during test query",
            details: testError.message,
            code: testError.code,
          },
          { status: 500 },
        )
      }

      console.log("Test query successful, table exists")
    } catch (testQueryError) {
      console.error("Exception during test query:", testQueryError)
      return NextResponse.json(
        {
          error: "Exception during test query",
          details: testQueryError instanceof Error ? testQueryError.message : String(testQueryError),
        },
        { status: 500 },
      )
    }

    // Now try the actual query with proper error handling
    try {
      // Fetch collections for the authenticated user
      const { data: collections, error: collectionsError } = await supabase
        .from("logo_collections")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (collectionsError) {
        console.error("Collections query error:", collectionsError)
        return NextResponse.json(
          {
            error: "Failed to fetch collections",
            details: collectionsError.message,
            code: collectionsError.code,
          },
          { status: 500 },
        )
      }

      console.log(`Successfully fetched ${collections?.length || 0} collections`)

      // For each collection, fetch its items
      const collectionsWithItems = []

      for (const collection of collections || []) {
        try {
          const { data: items, error: itemsError } = await supabase
            .from("logo_collection_items")
            .select("*, logos(*)")
            .eq("collection_id", collection.id)

          if (itemsError) {
            console.error(`Error fetching items for collection ${collection.id}:`, itemsError)
            // Continue with other collections even if one fails
            collectionsWithItems.push({
              ...collection,
              logo_collection_items: [],
            })
          } else {
            collectionsWithItems.push({
              ...collection,
              logo_collection_items: items || [],
            })
          }
        } catch (itemsError) {
          console.error(`Exception fetching items for collection ${collection.id}:`, itemsError)
          collectionsWithItems.push({
            ...collection,
            logo_collection_items: [],
          })
        }
      }

      // Validate that the response can be serialized to JSON
      try {
        // Test JSON serialization before returning
        const testJson = safeJsonStringify({ collections: collectionsWithItems })
        console.log("Response size:", testJson.length)
        console.log("Response structure:", Object.keys({ collections: collectionsWithItems }))
      } catch (jsonError) {
        console.error("JSON serialization error:", jsonError)
        return NextResponse.json(
          {
            error: "Failed to serialize response to JSON",
            details: jsonError instanceof Error ? jsonError.message : String(jsonError),
          },
          { status: 500 },
        )
      }

      // Return the collections with their items
      return NextResponse.json({ collections: collectionsWithItems })
    } catch (queryError) {
      console.error("Exception during collections query:", queryError)
      return NextResponse.json(
        {
          error: "Exception during collections query",
          details: queryError instanceof Error ? queryError.message : String(queryError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Unhandled error in collections API route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Verify authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Authentication error", details: sessionError.message }, { status: 401 })
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No active session" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate request body
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 })
    }

    // Create the collection
    const { data, error } = await supabase
      .from("logo_collections")
      .insert({
        name: body.name,
        description: body.description || null,
        user_id: session.user.id,
      })
      .select()

    if (error) {
      console.error("Error creating collection:", error)
      return NextResponse.json(
        {
          error: "Failed to create collection",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ collection: data[0] })
  } catch (error) {
    console.error("Unhandled error in collections POST route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
