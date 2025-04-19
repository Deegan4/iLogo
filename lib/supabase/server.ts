import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export const createClient = () => {
  try {
    const cookieStore = cookies()

    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  } catch (error) {
    console.error("Error creating Supabase client:", error)

    // Return a minimal client that will gracefully fail
    // This prevents the app from crashing completely
    return createServerComponentClient<Database>({
      cookies: () => new Map(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    })
  }
}
