"use client"

import { testAction, testRedirectAction } from "../test-action"
import { useState, useTransition } from "react"

export default function TestFormPage() {
  const [result, setResult] = useState<string>("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const res = await testAction(formData)
        setResult(JSON.stringify(res))
      } catch (error) {
        setResult(`Error: ${error}`)
      }
    })
  }

  const handleRedirectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await testRedirectAction(formData)
      } catch (error) {
        setResult(`Redirect Error: ${error}`)
      }
    })
  }

  return (
    <div className="p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Test Server Action</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          className="border p-2 w-full"
          defaultValue="TestName"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isPending ? "Loading..." : "Test Simple Action"}
        </button>
      </form>

      <form onSubmit={handleRedirectSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Enter name for redirect"
          className="border p-2 w-full"
          defaultValue="RedirectTest"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {isPending ? "Loading..." : "Test Redirect Action"}
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Result:</strong> {result}
        </div>
      )}
    </div>
  )
}
