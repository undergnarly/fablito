"use server"

import { redirect } from "next/navigation"
import { after } from "next/server"

export async function testAction(formData: FormData) {
  console.log("[TEST-ACTION] Called!")
  const name = formData.get("name")
  console.log("[TEST-ACTION] Name:", name)
  return { success: true, name }
}

// Test with redirect
export async function testRedirectAction(formData: FormData) {
  console.log("[TEST-REDIRECT] Called!")
  const name = formData.get("name")
  console.log("[TEST-REDIRECT] Name:", name)

  // Test after()
  after(() => {
    console.log("[TEST-REDIRECT] After callback executed!")
  })

  redirect("/test-form?success=true")
}
