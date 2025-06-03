import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("sessionId")?.value
    const authCookie = cookieStore.get("auth")?.value

    // Check MongoDB session if available
    if (sessionId && process.env.MONGODB_URI) {
      try {
        const { default: clientPromise } = await import("@/lib/mongodb")
        const client = await clientPromise
        const db = client.db("ecommerce")

        const session = await db.collection("sessions").findOne({
          sessionId,
          expiresAt: { $gt: new Date() },
        })

        if (session) {
          return NextResponse.json({
            isAuthenticated: true,
            username: session.username,
          })
        }
      } catch (mongoError) {
        console.error("MongoDB session check error:", mongoError)
        // Fall through to cookie check
      }
    }

    // Check simple auth cookie
    if (authCookie === "authenticated") {
      return NextResponse.json({
        isAuthenticated: true,
        username: "admin",
      })
    }

    // Clean up invalid session
    if (sessionId) {
      const cookieStore = await cookies()
      cookieStore.delete("sessionId")
    }

    return NextResponse.json({ isAuthenticated: false })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ isAuthenticated: false }, { status: 500 })
  }
}
