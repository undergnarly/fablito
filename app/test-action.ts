"use server"

export async function testAction(formData: FormData) {
  console.log("[TEST-ACTION] Called!")
  const name = formData.get("name")
  console.log("[TEST-ACTION] Name:", name)
  return { success: true, name }
}
