import { put, del, list, head } from "@vercel/blob"
import { nanoid } from "nanoid"

/**
 * Uploads an SVG string to Vercel Blob storage
 * @param svgContent The SVG content as a string
 * @param fileName Optional custom file name (without extension)
 * @returns The URL of the uploaded blob
 */
export async function uploadSvgToBlob(svgContent: string, fileName?: string): Promise<string> {
  try {
    // Create a blob from the SVG string
    const blob = new Blob([svgContent], { type: "image/svg+xml" })

    // Generate a unique file name if not provided
    const uniqueFileName = fileName || `logo-${nanoid(8)}`

    // Upload to Vercel Blob
    const { url } = await put(`${uniqueFileName}.svg`, blob, {
      access: "public",
      addRandomSuffix: true, // Add a random suffix to ensure uniqueness
    })

    return url
  } catch (error) {
    console.error("Error uploading SVG to Blob:", error)
    throw new Error("Failed to upload logo to storage")
  }
}

/**
 * Uploads a PNG/JPG image to Vercel Blob storage
 * @param imageBlob The image as a Blob
 * @param format The image format ('png' or 'jpg')
 * @param fileName Optional custom file name (without extension)
 * @returns The URL of the uploaded blob
 */
export async function uploadImageToBlob(imageBlob: Blob, format: "png" | "jpg", fileName?: string): Promise<string> {
  try {
    // Generate a unique file name if not provided
    const uniqueFileName = fileName || `logo-${nanoid(8)}`

    // Upload to Vercel Blob
    const { url } = await put(`${uniqueFileName}.${format}`, imageBlob, {
      access: "public",
      addRandomSuffix: true,
    })

    return url
  } catch (error) {
    console.error(`Error uploading ${format.toUpperCase()} to Blob:`, error)
    throw new Error(`Failed to upload ${format.toUpperCase()} to storage`)
  }
}

/**
 * Deletes a file from Vercel Blob storage
 * @param url The URL of the blob to delete
 * @returns A boolean indicating success
 */
export async function deleteFromBlob(url: string): Promise<boolean> {
  try {
    await del(url)
    return true
  } catch (error) {
    console.error("Error deleting from Blob:", error)
    return false
  }
}

/**
 * Lists all blobs with a specific prefix
 * @param prefix The prefix to filter by
 * @param limit Maximum number of blobs to return
 * @returns An array of blob objects
 */
export async function listBlobs(prefix = "", limit = 100) {
  try {
    const { blobs } = await list({ prefix, limit })
    return blobs
  } catch (error) {
    console.error("Error listing blobs:", error)
    return []
  }
}

/**
 * Checks if a blob exists
 * @param url The URL of the blob to check
 * @returns A boolean indicating if the blob exists
 */
export async function blobExists(url: string): Promise<boolean> {
  try {
    const blob = await head(url)
    return !!blob
  } catch (error) {
    return false
  }
}
