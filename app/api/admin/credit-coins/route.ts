import { NextRequest, NextResponse } from "next/server"
import { getUserByEmail, getUserById, updateUserCoins } from "@/lib/db"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

export async function POST(request: NextRequest) {
  // Verify admin password
  const adminPassword = request.headers.get("x-admin-password")
  if (!ADMIN_PASSWORD || adminPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, email, amount, description } = body

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount. Must be a positive number." }, { status: 400 })
    }

    if (!userId && !email) {
      return NextResponse.json({ error: "Either userId or email is required." }, { status: 400 })
    }

    // Resolve user
    let resolvedUserId = userId
    if (!resolvedUserId && email) {
      const user = await getUserByEmail(email)
      if (!user) {
        return NextResponse.json({ error: `User not found with email: ${email}` }, { status: 404 })
      }
      resolvedUserId = user.id
    }

    const result = await updateUserCoins(
      resolvedUserId,
      amount,
      "subscription",
      description || `Starter Pack — $5 (manual credit)`
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
      credited: amount,
    })
  } catch (error) {
    console.error("[Admin] Credit coins error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
