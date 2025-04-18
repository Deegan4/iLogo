"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Heart, Trash2, Share2, Edit, ArrowLeft } from "lucide-react"
import { LogoEditor } from "@/components/logo-editor"
import { ExportOptions } from "@/components/export-options"
import { ShareLogo } from "@/components/share-logo"
import type { Database } from "@/lib/database.types"
import { LogoImage } from "@/components/logo-image"
import { generateSizes } from "@/lib/image-service"

type Collection = Database["public"]["Tables"]["logo_collections"]["Row"]
type Logo = Database["public"]["Tables"]["logos"]["Row"]

interface CollectionViewProps {
  collection: Collection
  logos: Logo[]
}

export function CollectionView({ collection, logos: initialLogos }: CollectionViewProps) {
  const [logos, setLogos] = useState<Logo[]>(initialLogos)
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const toggleFavorite = async (logoId: string) => {
    try {
      // Find the logo to toggle
      const logo = logos.find((l) => l.id === logoId)
      if (!logo) return

      // Optimistically update the UI
      setLogos((prev) => prev.map((l) => (l.id === logoId ? { ...l, is_favorite: !l.is_favorite } : l)))

      // Update in the database
      const { error } = await supabase
        .from("logos")
        .update({ is_favorite: !logo.is_favorite, updated_at: new Date().toISOString() })
        .eq("id", logoId)
        .eq("user_id", user?.id)

      if (error) {
        throw error
      }
    } catch (err) {
      // Revert the optimistic update on error
      setLogos(initialLogos)
      console.error("Error toggling favorite:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update logo. Please try again.",
      })
    }
  }

  const removeFromCollection = async (logoId: string) => {
    try {
      // Optimistically update the UI
      setLogos((prev) => prev.filter((l) => l.id !== logoId))

      // Remove from the collection
      const { error } = await supabase
        .from("logo_collection_items")
        .delete()
        .eq("collection_id", collection.id)
        .eq("logo_id", logoId)

      if (error) {
        throw error
      }

      toast({
        title: "Logo removed",
        description: "Logo has been removed from this collection",
      })
    } catch (err) {
      // Revert the optimistic update on error
      setLogos(initialLogos)
      console.error("Error removing logo:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove logo. Please try again.",
      })
    }
  }

  const handleLogoUpdated = (logoId: string, updatedSvg: string) => {
    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === logoId ? { ...logo, svg_content: updatedSvg, updated_at: new Date().toISOString() } : logo,
      ),
    )
    setIsEditing(false)
    setSelectedLogo(null)

    toast({
      title: "Logo updated",
      description: "Your logo has been updated successfully",
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{collection.name}</h1>
        </div>
      </div>

      {collection.description && <p className="text-muted-foreground mb-6">{collection.description}</p>}

      {logos.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <h3 className="text-lg font-medium mb-2">No logos in this collection</h3>
          <p className="text-muted-foreground mb-4">Add logos to this collection from your dashboard</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {logos.map((logo) => (
            <Card key={logo.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-white p-4 flex items-center justify-center">
                  <LogoImage
                    svgContent={logo.svg_content}
                    sizes={generateSizes({
                      sm: "50vw",
                      md: "33vw",
                      lg: "25vw",
                    })}
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm truncate mb-2" title={logo.prompt}>
                    {logo.prompt}
                  </p>
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={logo.is_favorite ? "text-red-500" : ""}
                      onClick={() => toggleFavorite(logo.id)}
                    >
                      <Heart className="h-4 w-4" fill={logo.is_favorite ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedLogo(logo)
                        setIsEditing(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedLogo(logo)
                        setIsExporting(true)
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedLogo(logo)
                        setIsSharing(true)
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCollection(logo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Logo Editor Dialog */}
      {selectedLogo && isEditing && (
        <LogoEditor logo={selectedLogo} open={isEditing} onOpenChange={setIsEditing} onSave={handleLogoUpdated} />
      )}

      {/* Export Options Dialog */}
      {selectedLogo && isExporting && (
        <ExportOptions logo={selectedLogo} open={isExporting} onOpenChange={setIsExporting} />
      )}

      {/* Share Logo Dialog */}
      {selectedLogo && isSharing && <ShareLogo logo={selectedLogo} open={isSharing} onOpenChange={setIsSharing} />}
    </div>
  )
}
