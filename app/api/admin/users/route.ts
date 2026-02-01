import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllUsers, createUser, updateUser, deleteUser, getUserByEmail } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// Check admin auth
async function checkAdminAuth() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "true"
}

// GET - Get all users
export async function GET(request: NextRequest) {
  console.log("[ADMIN API] GET /api/admin/users - Fetch users request")

  // Check KV availability
  const isKvAvailable = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN &&
    process.env.KV_REST_API_URL !== "your_kv_rest_api_url_here" &&
    process.env.KV_REST_API_TOKEN !== "your_kv_rest_api_token_here"

  console.log("[ADMIN API] KV available:", isKvAvailable)

  if (!(await checkAdminAuth())) {
    console.log("[ADMIN API] Unauthorized - no admin session")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const users = await getAllUsers()
    console.log(`[ADMIN API] Returning ${users.length} users`)
    return NextResponse.json({
      users,
      _debug: {
        kvAvailable: isKvAvailable,
        userCount: users.length
      }
    })
  } catch (error) {
    console.error("[ADMIN API] Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users", _debug: { kvAvailable: isKvAvailable } }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  console.log("[ADMIN API] POST /api/admin/users - Create user request")

  if (!(await checkAdminAuth())) {
    console.log("[ADMIN API] Unauthorized - no admin session")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, name, password, coins = 500, isAnonymous = false } = body
    console.log("[ADMIN API] Creating user:", { email, name, coins, isAnonymous })

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await getUserByEmail(email)
      if (existingUser) {
        console.log("[ADMIN API] Email already exists:", email)
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }
    }

    const user = await createUser({
      email: email || undefined,
      name,
      passwordHash: password ? await hashPassword(password) : undefined,
      isActive: true,
      coins,
      isAnonymous,
    })

    console.log("[ADMIN API] User created successfully:", user.id)
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("[ADMIN API] Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // If password is being updated, hash it
    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password)
      delete updates.password
    }

    const user = await updateUser(id, updates)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await deleteUser(id)

    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
