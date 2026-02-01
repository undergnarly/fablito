import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getStory } from "@/lib/db"

// Check admin auth
async function checkAdminAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "true"
}

// GET - Get full story details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const story = await getStory(id)

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Parse storyContent and images if they are strings
    let storyContent = story.storyContent
    let images = story.images

    if (typeof storyContent === "string") {
      try {
        storyContent = JSON.parse(storyContent)
      } catch (e) {
        storyContent = null
      }
    }

    if (typeof images === "string") {
      try {
        images = JSON.parse(images)
      } catch (e) {
        images = []
      }
    }

    return NextResponse.json({
      ...story,
      storyContent,
      images
    })
  } catch (error) {
    console.error("[ADMIN API] Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}
