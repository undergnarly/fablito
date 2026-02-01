"use server"

import { redirect, unstable_rethrow } from "next/navigation"
import { createStory, updateStory } from "@/lib/db"
import { generateStoryInBackground } from "@/lib/story-generator"
import crypto from "crypto"
import { after } from "next/server"
import { getSetting, isKvAvailable } from "@/lib/settings"

export async function createStoryAction(formData: FormData) {
  console.log("[ACTIONS] Starting createStoryAction")
  console.log("[ACTIONS] Environment check:", {
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasKvToken: !!process.env.KV_REST_API_TOKEN,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasGoogleAI: !!process.env.GOOGLE_API_KEY,
    isKvAvailable
  })

  try {
    // Check if KV is available (imported from settings)

    // ВРЕМЕННО: Отключаем проверку KV для тестирования новой логики
    if (!isKvAvailable) {
      console.log("[ACTIONS] KV недоступен, но продолжаем для тестирования новой логики генерации")
      // throw new Error("Story creation is currently unavailable. Please set up the database configuration.")
    }

    // Check if submissions are halted (только если KV доступен)
    let submissionsHalted = false
    if (isKvAvailable) {
      try {
        submissionsHalted = await getSetting("SUBMISSIONS_HALTED")
        console.log(`[ACTIONS] Submissions halted: ${submissionsHalted}`)
      } catch (settingsError) {
        console.error("[ACTIONS] Error getting settings:", settingsError)
      }
    } else {
      console.log("[ACTIONS] KV недоступен - пропускаем проверку submissions_halted")
    }

    if (submissionsHalted) {
      throw new Error("Story submissions are temporarily halted due to high demand. Please try again later.")
    }

    // Extract new form data
    const childName = formData.get("childName") as string
    const childAge = parseInt(formData.get("childAge") as string) || 5
    const pageCount = parseInt(formData.get("pageCount") as string) || 10
    const theme = formData.get("theme") as string
    const language = formData.get("language") as string
    const illustrationStyle = formData.get("illustrationStyle") as string
    const visibility = (formData.get("visibility") as string) || "public"
    const textStory = formData.get("textStory") as string
    
    // Legacy compatibility
    const prompt = theme || "A fun alphabet adventure for children"
    const age = `${childAge}`

    console.log(`[ACTIONS] Form data - Child: ${childName}, Age: ${childAge}, Pages: ${pageCount}, Theme: ${theme}, Language: ${language}, Style: ${illustrationStyle}`)

    // Validation
    if (!childName) {
      throw new Error("Child's name is required")
    }
    if (!theme) {
      throw new Error("Story theme/moral is required")
    }
    if (childAge < 2 || childAge > 12) {
      throw new Error("Age must be between 2 and 12 years")
    }

    // Default age range if not provided
    const ageRange = age || "3-8"

    // Generate a unique ID for the story
    const storyId = crypto.randomUUID() as string;
    console.log(`[ACTIONS] Generated story ID: ${storyId}`)

    // Generate a deletion token
    const deletionToken = crypto.randomBytes(16).toString("hex")
    
    // Generate automatic title based on child name and theme
    const title = `${childName}'s Adventure`

    // Create the story in KV with new fields
    console.log(`[ACTIONS] Creating story in database...`)
    try {
      await createStory({
        id: storyId,
        title,

        // New required fields
        childName,
        childAge,
        theme,
        style: {
          language: language as "ru" | "en" | "kz"
        },
        textStory: textStory || undefined,

        // Legacy fields for compatibility
        prompt,
        age: ageRange,

        visibility: visibility === "unlisted" ? "unlisted" : "public",
        status: "generating",
        createdAt: new Date().toISOString(),
        deletionToken,
      })
      console.log(`[ACTIONS] Story created successfully in database`)
    } catch (dbError) {
      console.error(`[ACTIONS] Database error creating story:`, dbError)
      throw new Error(`Failed to create story in database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`)
    }

    // Use after() to run the story generation after the response is sent
    console.log(`[ACTIONS] Scheduling background story generation...`)
    if (isKvAvailable) {
      after(async () => {
        console.log(`[ACTIONS] Starting background story generation for ${storyId}`)
        await generateStoryInBackground(storyId, {
          childName,
          childAge,
          pageCount,
          theme,
          style: {
            language: language as "ru" | "en" | "kz",
            illustration: illustrationStyle
          },
          textStory: textStory || undefined
        })
      })
    } else {
      // Для локальной разработки запускаем генерацию в фоне
      console.log(`[ACTIONS] KV недоступен - запускаем генерацию в фоне для локальной разработки`)
      after(async () => {
        console.log(`[ACTIONS] Starting background story generation for ${storyId} (local mode)`)
        await generateStoryInBackground(storyId, {
          childName,
          childAge,
          pageCount,
          theme,
          style: {
            language: language as "ru" | "en" | "kz",
            illustration: illustrationStyle
          },
          textStory: textStory || undefined
        })
      })
    }

    // Всегда перенаправляем пользователя для показа процесса
    console.log(`[ACTIONS] Redirecting to generating page: /generating/${storyId}`)
    redirect(`/generating/${storyId}`)
  } catch (error) {
    unstable_rethrow(error)
    console.error("Error creating story:", error)
    throw error
  }
}

export async function updateStoryVisibilityAction(formData: FormData) {
  try {
    const storyId = formData.get("storyId") as string
    const visibility = formData.get("visibility") as string

    if (!storyId) {
      throw new Error("Story ID is required")
    }

    // Update the story visibility
    const updatedStory = await updateStory(storyId, {
      visibility: visibility === "unlisted" ? "unlisted" : "public",
    })

    return { success: true, story: updatedStory }
  } catch (error) {
    console.error("Error updating story visibility:", error)
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" }
  }
}

