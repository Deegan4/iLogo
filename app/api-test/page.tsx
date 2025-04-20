"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button-custom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ApiTestPage() {
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawResponse, setRawResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testApi = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)
    setRawResponse(null)

    try {
      // Add a cache-busting parameter
      const timestamp = new Date().getTime()
      const res = await fetch(`/api/collections?t=${timestamp}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      // Get the raw text response first
      const text = await res.text()
      setRawResponse(text)

      // Try to parse it as JSON
      try {
        const data = JSON.parse(text)
        setResponse(data)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        setError(`Failed to parse response as JSON: ${parseError.message}`)
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      setError(`Fetch error: ${fetchError.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>

      <div className="mb-4">
        <Button onClick={testApi} disabled={isLoading}>
          {isLoading ? "Testing..." : "Test Collections API"}
        </Button>
      </div>

      {error && (
        <Card className="mb-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-red-50 p-4 rounded overflow-auto text-red-800 text-sm">{error}</pre>
          </CardContent>
        </Card>
      )}

      {rawResponse && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Raw Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Response Length:</strong> {rawResponse.length} characters
            </div>
            <div className="mb-2">
              <strong>First 20 characters:</strong> "{rawResponse.substring(0, 20)}..."
            </div>
            <div className="mb-2">
              <strong>Character codes of first 10 characters:</strong>
              <ul className="list-disc pl-5">
                {Array.from(rawResponse.substring(0, 10)).map((char, i) => (
                  <li key={i}>
                    Position {i}: "{char}" (ASCII: {char.charCodeAt(0)})
                  </li>
                ))}
              </ul>
            </div>
            <details>
              <summary className="cursor-pointer text-blue-500 hover:text-blue-700">View Full Raw Response</summary>
              <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm mt-2">{rawResponse}</pre>
            </details>
          </CardContent>
        </Card>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded overflow-auto text-sm">{JSON.stringify(response, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
