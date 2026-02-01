import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById, updateUserCoins } from "@/lib/db"

// Monthly subscription coins
const SUBSCRIPTION_COINS = 3000

export async function POST(request: NextRequest) {
  try {
    // Get user from cookies
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if real Stripe is configured
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID) {
      // TODO: Real Stripe integration
      // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      // const session = await stripe.checkout.sessions.create({...})
      // return NextResponse.json({ url: session.url })
    }

    // SIMULATION MODE: Add coins directly without payment
    console.log(`[STRIPE SIMULATION] Adding ${SUBSCRIPTION_COINS} coins to user ${userId}`)

    const result = await updateUserCoins(
      userId,
      SUBSCRIPTION_COINS,
      "subscription",
      "Monthly subscription - 3000 coins (SIMULATION)"
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to add coins" },
        { status: 500 }
      )
    }

    console.log(`[STRIPE SIMULATION] Success! New balance: ${result.newBalance}`)

    return NextResponse.json({
      success: true,
      simulation: true,
      coinsAdded: SUBSCRIPTION_COINS,
      newBalance: result.newBalance,
      message: "Subscription simulated successfully! Coins added to your account."
    })

  } catch (error) {
    console.error("[STRIPE] Checkout error:", error)
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    )
  }
}
