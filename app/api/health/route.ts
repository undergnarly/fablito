import { NextResponse } from "next/server"

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: {
      hasKvUrl: !!process.env.KV_REST_API_URL,
      hasKvToken: !!process.env.KV_REST_API_TOKEN,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasGoogleAI: !!process.env.GOOGLE_API_KEY,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV,
    },
    kvCheck: false,
    error: null as string | null,
  }

  // Try to connect to KV
  if (status.environment.hasKvUrl && status.environment.hasKvToken) {
    try {
      const { kv } = await import("@vercel/kv")
      await kv.ping()
      status.kvCheck = true
    } catch (error) {
      status.error = error instanceof Error ? error.message : "Unknown KV error"
    }
  }

  return NextResponse.json(status)
}
