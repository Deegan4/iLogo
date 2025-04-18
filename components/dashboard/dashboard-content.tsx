"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@/components/dashboard/user-profile"
import { LogoGallery } from "@/components/dashboard/logo-gallery"
import { LogoCollections } from "@/components/dashboard/logo-collections"
import type { Database } from "@/lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Logo = Database["public"]["Tables"]["logos"]["Row"]
type Collection = Database["public"]["Tables"]["logo_collections"]["Row"]

interface DashboardContentProps {
  profile: Profile
  logos: Logo[]
  collections: Collection[]
}

export function DashboardContent({ profile, logos, collections }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("logos")

  return (
    <Tabs defaultValue="logos" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="logos">My Logos</TabsTrigger>
        <TabsTrigger value="collections">Collections</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
      </TabsList>

      <TabsContent value="logos">
        <LogoGallery logos={logos} />
      </TabsContent>

      <TabsContent value="collections">
        <LogoCollections collections={collections} />
      </TabsContent>

      <TabsContent value="profile">
        <UserProfile profile={profile} />
      </TabsContent>
    </Tabs>
  )
}
