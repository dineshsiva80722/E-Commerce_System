import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { mongodbUri } = await request.json()

    if (!mongodbUri) {
      return NextResponse.json({ error: "MongoDB URI is required" }, { status: 400 })
    }

    // Validate the MongoDB URI format
    try {
      new URL(mongodbUri)
    } catch {
      return NextResponse.json({ error: "Invalid MongoDB URI format" }, { status: 400 })
    }

    // Return success - the actual environment variables should be set through Vercel's environment variables
    return NextResponse.json({
      success: true,
      message: "MongoDB URI validated successfully",
      instructions: "Please configure the MONGODB_URI environment variable in your Vercel project settings"
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to process setup request" }, { status: 500 })
  }
}
