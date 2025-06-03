import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ connected: false, error: "MongoDB URI not configured" })
    }

    // Try to check MongoDB connection
    try {
      const { checkMongoDBConnection } = await import("@/lib/mongodb")
      const status = await checkMongoDBConnection()
      return NextResponse.json(status)
    } catch (importError) {
      console.error("Error importing MongoDB:", importError)
      return NextResponse.json({ connected: false, error: "MongoDB module not available" })
    }
  } catch (error) {
    console.error("Error checking MongoDB status:", error)
    return NextResponse.json({ connected: false, error: String(error) }, { status: 500 })
  }
}
