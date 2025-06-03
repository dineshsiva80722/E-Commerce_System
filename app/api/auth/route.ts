import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Simple authentication for demo
    if (username === "admin" && password === "password") {
      // Try to use MongoDB if available, otherwise use simple session
      if (process.env.MONGODB_URI) {
        try {
          // Dynamic imports to avoid build issues
          const { v4: uuidv4 } = await import("uuid")
          const { default: clientPromise } = await import("@/lib/mongodb")
          const client = await clientPromise
          const db = client.db("ecommerce")

          // Create a session
          const sessionId = uuidv4()

          await db.collection("sessions").insertOne({
            sessionId,
            username,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          })

          // Set a cookie
          const cookieStore = await cookies()
          cookieStore.set({
            name: "sessionId",
            value: sessionId,
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          })
        } catch (mongoError) {
          console.error("MongoDB session error:", mongoError)
          // Fall back to simple cookie
          const cookieStore = await cookies()
          cookieStore.set({
            name: "auth",
            value: "authenticated",
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          })
        }
      } else {
        // Simple cookie-based auth
        const cookieStore = await cookies()
        cookieStore.set({
          name: "auth",
          value: "authenticated",
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60, // 7 days
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("sessionId")
    cookieStore.delete("auth")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
