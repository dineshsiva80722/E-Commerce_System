import type { MongoClient } from "mongodb"

let clientPromise: Promise<MongoClient>

if (process.env.MONGODB_URI) {
  const uri = process.env.MONGODB_URI

  // Dynamic import to avoid build issues with Bun
  const getClient = async () => {
    const { MongoClient, ServerApiVersion } = await import("mongodb")

    const options = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    }

    const client = new MongoClient(uri, options)
    return client.connect()
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable
    const globalWithMongo = global as typeof global & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = getClient()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // In production mode
    clientPromise = getClient()
  }
} else {
  // Create a rejected promise when no URI is provided
  clientPromise = Promise.reject(new Error("MongoDB URI not configured"))
}

export default clientPromise

export async function checkMongoDBConnection() {
  try {
    if (!process.env.MONGODB_URI) {
      return { connected: false, error: "MongoDB URI not configured" }
    }

    const client = await clientPromise
    await client.db("admin").command({ ping: 1 })
    return { connected: true, error: null }
  } catch (error) {
    console.error("MongoDB connection error:", error)
    return { connected: false, error: String(error) }
  }
}
