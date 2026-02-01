import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, getUserById, updateUserCoins } from "@/lib/db"
import { verifyPassword, isValidEmail } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Аккаунт не активирован" },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Аккаунт деактивирован" },
        { status: 403 }
      )
    }

    // Check if there was an anonymous user session and merge coins
    const cookieStore = await cookies()
    const anonymousUserId = cookieStore.get("user_id")?.value

    if (anonymousUserId && anonymousUserId !== user.id) {
      const anonymousUser = await getUserById(anonymousUserId)

      if (anonymousUser?.isAnonymous && anonymousUser.coins > 0) {
        // Transfer remaining coins from anonymous user to logged in user
        await updateUserCoins(
          user.id,
          anonymousUser.coins,
          "welcome",
          "Перенос монеток с гостевого аккаунта"
        )
        console.log(`[AUTH] Transferred ${anonymousUser.coins} coins from anonymous to ${user.email}`)
      }
    }

    // Get updated user data
    const updatedUser = await getUserByEmail(email)

    // Set session cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        coins: updatedUser!.coins,
        isAnonymous: updatedUser!.isAnonymous,
      }
    })

    response.cookies.set("user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    response.cookies.set("user_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    console.log(`[AUTH] User logged in: ${user.email}`)

    return response
  } catch (error) {
    console.error("[AUTH] Login error:", error)
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    )
  }
}
