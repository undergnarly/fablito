import { NextRequest, NextResponse } from "next/server"
import { updateUserCoins } from "@/lib/db"

// Stripe webhook handler
// This will be called by Stripe when a payment is successful

// Monthly subscription coins
const SUBSCRIPTION_COINS = 3000

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    // TODO: Verify Stripe webhook signature
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const event = stripe.webhooks.constructEvent(
    //   body,
    //   signature,
    //   process.env.STRIPE_WEBHOOK_SECRET!
    // )

    // TODO: Handle different event types
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     const session = event.data.object
    //     const userId = session.metadata?.userId
    //     if (userId) {
    //       await updateUserCoins(
    //         userId,
    //         SUBSCRIPTION_COINS,
    //         'subscription',
    //         'Monthly subscription - 3000 coins'
    //       )
    //     }
    //     break
    //
    //   case 'invoice.payment_succeeded':
    //     // Handle recurring subscription payment
    //     const invoice = event.data.object
    //     const customerId = invoice.customer
    //     // Find user by Stripe customer ID and add coins
    //     break
    //
    //   case 'customer.subscription.deleted':
    //     // Handle subscription cancellation
    //     break
    // }

    // Placeholder response
    console.log("[STRIPE WEBHOOK] Received webhook (not yet configured)")
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("[STRIPE WEBHOOK] Error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
