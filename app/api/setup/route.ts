import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { mongodbUri } = await request.json()

    if (!mongodbUri) {
      return NextResponse.json({ error: "MongoDB URI is required" }, { status: 400 })
    }

    // In a real deployment, you would save this to environment variables
    // For this demo, we'll just validate the URI format
    try {
      new URL(mongodbUri)
    } catch {
      return NextResponse.json({ error: "Invalid MongoDB URI format" }, { status: 400 })
    }

    // Set environment variables in the current process for this session
    process.env.MONGODB_URI = mongodbUri
    process.env.NEXT_PUBLIC_HAS_MONGODB = "true"

    return NextResponse.json({
      success: true,
      message: "MongoDB URI configured successfully",
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Failed to process setup request" }, { status: 500 })
  }
}
