import { put } from "@vercel/blob"
import { nanoid } from "nanoid"
import sharp from "sharp"

/**
 * Converts image buffer to WebP format for better compression
 */
async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer()
  } catch (error) {
    console.error("[BLOB-STORAGE] WebP conversion failed, using original:", error)
    return buffer
  }
}

/**
 * Uploads a base64 image to Vercel Blob storage (converted to WebP)
 * @param base64Data The base64 data URL of the image
 * @param storyId The ID of the story
 * @param pageIndex The index of the page in the story
 * @returns The URL of the uploaded image
 */
export async function uploadImageToBlob(base64Data: string, storyId: string, pageIndex: number): Promise<string> {
  try {
    // Skip if it's already a URL (not a base64 string)
    if (!base64Data.startsWith("data:")) {
      return base64Data
    }

    // Для локальной разработки без BLOB_READ_WRITE_TOKEN возвращаем base64 данные
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return base64Data
    }

    // Extract the mime type and base64 content
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 data")
    }

    const base64Content = matches[2]

    // Convert base64 to buffer
    let buffer = Buffer.from(base64Content, "base64")

    // Convert to WebP for better compression
    buffer = await convertToWebP(buffer)

    // Generate a unique filename with .webp extension
    const filename = `${storyId}-page-${pageIndex}-${nanoid(6)}.webp`

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      contentType: "image/webp",
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("[BLOB-STORAGE] Error uploading image to Blob:", error)
    // Return the original base64 data if upload fails
    return base64Data
  }
}

/**
 * Converts an array of base64 images to Blob URLs
 * @param images Array of base64 images or URLs
 * @param storyId The ID of the story
 * @returns Array of Blob URLs
 */
export async function convertImagesToBlob(images: string[], storyId: string): Promise<string[]> {
  if (!images || !Array.isArray(images)) {
    return []
  }

  // Для локальной разработки без BLOB_READ_WRITE_TOKEN возвращаем исходные данные
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("[BLOB-STORAGE] Local development mode: returning original images")
    return images
  }

  const blobUrls = []

  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    if (!image) continue

    try {
      const blobUrl = await uploadImageToBlob(image, storyId, i)
      blobUrls.push(blobUrl)
    } catch (error) {
      console.error(`[BLOB-STORAGE] Error converting image ${i} to blob:`, error)
      blobUrls.push(image) // Keep the original in case of error
    }
  }

  return blobUrls
}

