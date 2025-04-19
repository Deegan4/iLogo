// Enable debug mode for detailed logging
const DEBUG_ROUTING = process.env.NODE_ENV === "development" || process.env.DEBUG_ROUTING === "true"

// Log levels
type LogLevel = "debug" | "info" | "warn" | "error"

// Route logger class
export class RouteLogger {
  private static instance: RouteLogger
  private logToServer = false
  private sessionId = ""

  private constructor() {
    // Generate a unique session ID for tracking requests
    this.sessionId = Math.random().toString(36).substring(2, 15)

    if (DEBUG_ROUTING) {
      console.log(`[RouteLogger] 🚀 Initialized with session ID: ${this.sessionId}`)
    }
  }

  public static getInstance(): RouteLogger {
    if (!RouteLogger.instance) {
      RouteLogger.instance = new RouteLogger()
    }
    return RouteLogger.instance
  }

  // Enable/disable server logging
  public enableServerLogging(enable: boolean): void {
    this.logToServer = enable
    if (DEBUG_ROUTING) {
      console.log(`[RouteLogger] 🔄 Server logging ${enable ? "enabled" : "disabled"}`)
    }
  }

  // Log a route navigation
  public logNavigation(from: string, to: string, details?: Record<string, any>): void {
    this.log("info", `Navigation: ${from} → ${to}`, details)
  }

  // Log a route error
  public logError(route: string, error: Error | string, details?: Record<string, any>): void {
    this.log("error", `Error on route ${route}: ${error instanceof Error ? error.message : error}`, {
      ...(details || {}),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }

  // Log a route event
  public logEvent(route: string, event: string, details?: Record<string, any>): void {
    this.log("info", `Event on route ${route}: ${event}`, details)
  }

  // Log a 404 error
  public log404(route: string, referrer?: string): void {
    this.log("warn", `404 Not Found: ${route}`, { referrer })

    // Send to server if enabled
    if (this.logToServer) {
      this.sendToServer("404", {
        route,
        referrer,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
      })
    }
  }

  // General logging method
  private log(level: LogLevel, message: string, details?: Record<string, any>): void {
    if (!DEBUG_ROUTING && level === "debug") return

    const timestamp = new Date().toISOString()
    const prefix = `[Route ${level.toUpperCase()}]`

    // Add emoji based on log level
    const emoji = level === "debug" ? "🔍" : level === "info" ? "📌" : level === "warn" ? "⚠️" : "❌"

    console[level === "debug" ? "log" : level === "info" ? "log" : level === "warn" ? "warn" : "error"](
      `${prefix} ${emoji} ${message}`,
      details || "",
    )

    // Send to server if enabled and not debug level
    if (this.logToServer && level !== "debug") {
      this.sendToServer(level, {
        message,
        details,
        timestamp,
        sessionId: this.sessionId,
      })
    }
  }

  // Send logs to server
  private async sendToServer(level: string, data: Record<string, any>): Promise<void> {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level,
          ...data,
        }),
      })
    } catch (error) {
      // Don't use the logger here to avoid infinite loops
      console.error("[RouteLogger] Failed to send log to server:", error)
    }
  }
}

// Export a singleton instance
export const routeLogger = RouteLogger.getInstance()

// Helper functions for easier usage
export const logNavigation = (from: string, to: string, details?: Record<string, any>) =>
  routeLogger.logNavigation(from, to, details)

export const logRouteError = (route: string, error: Error | string, details?: Record<string, any>) =>
  routeLogger.logError(route, error, details)

export const logRouteEvent = (route: string, event: string, details?: Record<string, any>) =>
  routeLogger.logEvent(route, event, details)

export const log404 = (route: string, referrer?: string) => routeLogger.log404(route, referrer)
