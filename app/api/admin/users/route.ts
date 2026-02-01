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
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const users = await getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, name, password, coins = 500, isAnonymous = false } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingUser = await getUserByEmail(email)
      if (existingUser) {
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

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error creating user:", error)
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
