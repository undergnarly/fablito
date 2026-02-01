import { kv } from "@vercel/kv"

async function getDebugInfo() {
  const logs: string[] = []
  const errors: string[] = []

  logs.push(`[${new Date().toISOString()}] Starting debug check...`)

  // Check environment variables
  const envCheck = {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  }

  logs.push(`Environment variables: ${JSON.stringify(envCheck, null, 2)}`)

  // Test KV connection
  let kvStatus = "not tested"
  if (envCheck.KV_REST_API_URL && envCheck.KV_REST_API_TOKEN) {
    try {
      logs.push("Testing KV connection...")
      const pingResult = await kv.ping()
      logs.push(`KV ping result: ${pingResult}`)
      kvStatus = "connected"

      // Try to list keys
      const keys = await kv.keys("story:*")
      logs.push(`Found ${keys.length} stories in KV`)
    } catch (error) {
      kvStatus = "error"
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(`KV Error: ${errorMessage}`)
      logs.push(`KV connection failed: ${errorMessage}`)
    }
  } else {
    kvStatus = "missing credentials"
    logs.push("KV credentials not configured")
  }

  // Test OpenAI
  let openaiStatus = "not tested"
  if (envCheck.OPENAI_API_KEY) {
    try {
      logs.push("Testing OpenAI API...")
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      })
      if (response.ok) {
        openaiStatus = "connected"
        logs.push("OpenAI API is accessible")
      } else {
        openaiStatus = `error (${response.status})`
        errors.push(`OpenAI API error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      openaiStatus = "error"
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(`OpenAI Error: ${errorMessage}`)
    }
  } else {
    openaiStatus = "missing key"
    logs.push("OpenAI API key not configured")
  }

  // Test Google AI
  let googleStatus = "not tested"
  if (envCheck.GOOGLE_API_KEY) {
    logs.push("Google API key is configured")
    googleStatus = "configured"
  } else {
    googleStatus = "missing key"
    logs.push("Google API key not configured")
  }

  // Test Blob
  let blobStatus = "not tested"
  if (envCheck.BLOB_READ_WRITE_TOKEN) {
    logs.push("Blob token is configured")
    blobStatus = "configured"
  } else {
    blobStatus = "missing token"
    logs.push("Blob token not configured")
  }

  return {
    logs,
    errors,
    status: {
      kv: kvStatus,
      openai: openaiStatus,
      google: googleStatus,
      blob: blobStatus,
    },
    envCheck,
  }
}

export default async function DebugPage() {
  const debug = await getDebugInfo()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Fablito Debug Page</h1>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatusCard title="KV Database" status={debug.status.kv} />
        <StatusCard title="OpenAI API" status={debug.status.openai} />
        <StatusCard title="Google AI" status={debug.status.google} />
        <StatusCard title="Blob Storage" status={debug.status.blob} />
      </div>

      {/* Environment Variables */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {Object.entries(debug.envCheck).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400">{key}:</span>
              <span className={value ? "text-green-400" : "text-red-400"}>
                {typeof value === "boolean" ? (value ? "✓ SET" : "✗ MISSING") : value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {debug.errors.length > 0 && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-300">Errors</h2>
          <ul className="list-disc list-inside space-y-2 font-mono text-sm">
            {debug.errors.map((error, i) => (
              <li key={i} className="text-red-200">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Logs</h2>
        <div className="bg-black rounded p-4 font-mono text-sm max-h-96 overflow-auto">
          {debug.logs.map((log, i) => (
            <div key={i} className="text-gray-300 py-1 border-b border-gray-700">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusCard({ title, status }: { title: string; status: string }) {
  const isGood = status === "connected" || status === "configured"
  const isError = status.includes("error") || status.includes("missing")

  return (
    <div
      className={`rounded-lg p-4 ${
        isGood ? "bg-green-900/50 border border-green-500" : isError ? "bg-red-900/50 border border-red-500" : "bg-yellow-900/50 border border-yellow-500"
      }`}
    >
      <h3 className="font-medium text-sm text-gray-300">{title}</h3>
      <p className={`text-lg font-bold ${isGood ? "text-green-400" : isError ? "text-red-400" : "text-yellow-400"}`}>{status}</p>
    </div>
  )
}
