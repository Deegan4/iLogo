"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { RefreshCw, Download, Search } from "lucide-react"

export default function RouteLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/log")
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (error) {
      console.error("Failed to fetch logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    // Refresh logs every 5 seconds
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  // Filter logs based on search and tab
  const filteredLogs = logs.filter((log) => {
    // Apply text filter
    const searchMatch = filter === "" || JSON.stringify(log).toLowerCase().includes(filter.toLowerCase())

    // Apply tab filter
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "404" && log.level === "404") ||
      (activeTab === "error" && log.level === "error") ||
      (activeTab === "navigation" && log.message?.includes("Navigation:")) ||
      (activeTab === "other" && !["404", "error"].includes(log.level) && !log.message?.includes("Navigation:"))

    return searchMatch && tabMatch
  })

  // Download logs as JSON
  const downloadLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `route-logs-${new Date().toISOString()}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Route Logs</CardTitle>
              <CardDescription>View and analyze routing activity and errors</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="navigation">Navigation</TabsTrigger>
                  <TabsTrigger value="404">404 Errors</TabsTrigger>
                  <TabsTrigger value="error">Errors</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="border rounded-md">
              {loading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading logs...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No logs found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredLogs.map((log, index) => (
                    <div key={index} className="p-4 hover:bg-muted/50">
                      <div className="flex justify-between mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            log.level === "error"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                              : log.level === "404"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
                                : log.level === "warn"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                          }`}
                        >
                          {log.level?.toUpperCase() || "INFO"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.message || "Log event"}</p>
                      {log.details && (
                        <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto max-h-40">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
