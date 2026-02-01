import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById, createAnonymousUser } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    // If no user cookie, create anonymous user
    if (!userId) {
      const newUser = await createAnonymousUser()

      const response = NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          coins: newUser.coins,
          isAnonymous: newUser.isAnonymous,
          createdAt: newUser.createdAt,
        }
      })

      // Set user cookie (30 days)
      response.cookies.set("user_id", newUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })

      return response
    }

    // Get existing user
    const user = await getUserById(userId)

    if (!user) {
      // User cookie exists but user not found, create new anonymous user
      const newUser = await createAnonymousUser()

      const response = NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          coins: newUser.coins,
          isAnonymous: newUser.isAnonymous,
          createdAt: newUser.createdAt,
        }
      })

      response.cookies.set("user_id", newUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      })

      return response
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
        isAnonymous: user.isAnonymous,
        createdAt: user.createdAt,
      }
    })
  } catch (error) {
    console.error("[AUTH] Error getting user:", error)
    return NextResponse.json(
      { error: "Failed to get user" },
      { status: 500 }
    )
  }
}
