import { type NextRequest, NextResponse } from "next/server"

// Enable debug mode for detailed logging
const DEBUG_ROUTING = process.env.NODE_ENV === "development" || process.env.DEBUG_ROUTING === "true"
// Maximum number of logs to keep in memory
const MAX_LOGS = 100

// In-memory log storage (for development)
let logs: any[] = []

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json()

    // Add timestamp if not present
    if (!logData.timestamp) {
      logData.timestamp = new Date().toISOString()
    }

    // Store log in memory (for development)
    if (process.env.NODE_ENV === "development") {
      logs.unshift(logData)
      // Keep only the last MAX_LOGS entries
      if (logs.length > MAX_LOGS) {
        logs = logs.slice(0, MAX_LOGS)
      }
    }

    // In production, you might want to store logs in a database or send to a logging service
    if (process.env.NODE_ENV === "production") {
      // Example: Send to a logging service
      // await sendToLoggingService(logData)
    }

    if (DEBUG_ROUTING) {
      console.log(`[API] 📝 Log received: ${logData.level} - ${logData.message || JSON.stringify(logData)}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] ❌ Error processing log:", error)
    return NextResponse.json({ success: false, error: "Failed to process log" }, { status: 500 })
  }
}

export async function GET() {
  // Only allow access to logs in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  return NextResponse.json({ logs })
}
