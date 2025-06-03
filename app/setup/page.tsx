"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Database, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [mongodbUri, setMongodbUri] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupStatus, setSetupStatus] = useState<{
    products?: string
    sessions?: string
    uploads?: string
  }>({})
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error: string | null }>({
    connected: false,
    error: null,
  })
  const router = useRouter()

  // Check if MongoDB is already set up
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/db-status")
        if (response.ok) {
          const data = await response.json()
          setDbStatus(data)

          if (data.connected) {
            // If already connected, check if setup is complete
            const setupResponse = await fetch("/api/mongodb-setup")
            if (setupResponse.ok) {
              const setupData = await setupResponse.json()
              if (setupData.success) {
                setSetupStatus(setupData.collections)
                setSetupComplete(true)
              }
            }
          }
        }
      } catch (err) {
        console.error("Error checking DB status:", err)
      }
    }

    checkDbStatus()
  }, [])

  const handleSetup = async () => {
    if (!mongodbUri) {
      setError("MongoDB URI is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Save MongoDB URI
      const setupResponse = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mongodbUri }),
      })

      if (!setupResponse.ok) {
        const data = await setupResponse.json()
        throw new Error(data.error || "Failed to save MongoDB URI")
      }

      // Check connection after saving URI
      const statusResponse = await fetch("/api/db-status")
      if (!statusResponse.ok) {
        throw new Error("Failed to verify MongoDB connection")
      }

      const statusData = await statusResponse.json()
      if (!statusData.connected) {
        throw new Error(statusData.error || "Failed to connect to MongoDB with the provided URI")
      }

      // Initialize MongoDB collections
      const mongoSetupResponse = await fetch("/api/mongodb-setup")
      if (!mongoSetupResponse.ok) {
        const data = await mongoSetupResponse.json()
        throw new Error(data.error || "Failed to setup MongoDB collections")
      }

      const mongoData = await mongoSetupResponse.json()
      setSetupStatus(mongoData.collections)
      setSetupComplete(true)

      // Force reload to apply new environment variables
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Setup Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Collections Status:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span className="capitalize text-green-600">{setupStatus.products}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sessions:</span>
                  <span className="capitalize text-green-600">{setupStatus.sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uploads:</span>
                  <span className="capitalize text-green-600">{setupStatus.uploads}</span>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                Your e-commerce database has been successfully configured. You can now use the application with MongoDB
                integration.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <a href="/">Go to Home</a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href="/admin">Admin Dashboard</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <p className="text-muted-foreground">Configure your MongoDB connection</p>

          {dbStatus.connected && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>MongoDB is already connected</span>
            </div>
          )}

          {dbStatus.error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Connection error: {dbStatus.error}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="mongodb-uri" className="block text-sm font-medium mb-2">
              MongoDB Connection URI
            </label>
            <Input
              id="mongodb-uri"
              type="text"
              value={mongodbUri}
              onChange={(e) => setMongodbUri(e.target.value)}
              placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your MongoDB Atlas connection string or local MongoDB URI
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSetup} disabled={isLoading || !mongodbUri} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up database...
              </>
            ) : (
              "Setup Database"
            )}
          </Button>

          <div className="text-center">
            <Button variant="link" asChild>
              <a href="/">Skip setup (use localStorage)</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
