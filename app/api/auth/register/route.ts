import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById, getUserByEmail, convertAnonymousToUser, createUser } from "@/lib/db"
import { hashPassword, isValidEmail, validatePassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password and name are required" },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join('. ') },
        { status: 400 }
      )
    }

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Check if user has anonymous session
    const cookieStore = await cookies()
    const existingUserId = cookieStore.get("user_id")?.value

    let user

    if (existingUserId) {
      // Try to convert anonymous user to registered
      const existingAnonymousUser = await getUserById(existingUserId)

      if (existingAnonymousUser?.isAnonymous) {
        // Convert anonymous user - this adds +50 bonus coins
        user = await convertAnonymousToUser(existingUserId, email, name, passwordHash)

        if (!user) {
          return NextResponse.json(
            { error: "Failed to convert anonymous user" },
            { status: 500 }
          )
        }
      }
    }

    // If no anonymous user to convert, create new user
    if (!user) {
      const REGISTRATION_COINS = 500 // Welcome bonus

      user = await createUser({
        email,
        name,
        passwordHash,
        isActive: true,
        coins: REGISTRATION_COINS,
        isAnonymous: false,
      })
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        coins: user.coins,
        isAnonymous: user.isAnonymous,
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

    console.log(`[AUTH] User registered: ${user.email} with ${user.coins} coins`)

    return response
  } catch (error) {
    console.error("[AUTH] Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}
