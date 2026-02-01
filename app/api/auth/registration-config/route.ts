import { NextResponse } from "next/server"
import { getSetting } from "@/lib/settings"

export async function GET() {
  try {
    const registrationCode = await getSetting("REGISTRATION_CODE")
    const requireCode = !!(registrationCode && registrationCode.trim() !== "")

    return NextResponse.json({ requireCode })
  } catch (error) {
    console.error("[AUTH] Error getting registration config:", error)
    return NextResponse.json({ requireCode: false })
  }
}
