import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB URI not configured" }, { status: 400 })
    }

    // Try to import and use MongoDB
    try {
      const { MongoClient } = await import("mongodb")
      const client = new MongoClient(process.env.MONGODB_URI)

      await client.connect()
      const db = client.db("ecommerce")

      // Check if collections exist
      const collections = await db.listCollections().toArray()
      const hasProducts = collections.some((col) => col.name === "products")
      const hasSessions = collections.some((col) => col.name === "sessions")
      const hasUploads = collections.some((col) => col.name === "uploads")

      if (!hasProducts) {
        // Create products collection with initial data
        const initialProducts = [
          {
            name: "Premium Wireless Headphones",
            price: 299.99,
            image: "/placeholder.svg?height=400&width=400",
            description:
              "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
            category: "Electronics",
            discount: 20,
            stock: 15,
            rating: 4.8,
            reviews: 124,
            tags: ["Popular", "Hot Deal"],
            approved: true,
            createdAt: new Date(),
          },
          {
            name: "Smart Fitness Watch",
            price: 199.99,
            image: "/placeholder.svg?height=400&width=400",
            description: "Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration.",
            category: "Wearables",
            discount: 15,
            stock: 8,
            rating: 4.6,
            reviews: 89,
            tags: ["New", "Limited Stock"],
            approved: true,
            createdAt: new Date(),
          },
          {
            name: "Organic Cotton T-Shirt",
            price: 29.99,
            image: "/placeholder.svg?height=400&width=400",
            description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors.",
            category: "Clothing",
            stock: 25,
            rating: 4.4,
            reviews: 67,
            tags: ["Eco-Friendly"],
            approved: true,
            createdAt: new Date(),
          },
          {
            name: "Professional Camera Lens",
            price: 899.99,
            image: "/placeholder.svg?height=400&width=400",
            description: "Professional-grade camera lens with superior optics and build quality.",
            category: "Photography",
            discount: 10,
            stock: 5,
            rating: 4.9,
            reviews: 156,
            tags: ["Professional", "Limited Stock"],
            approved: true,
            createdAt: new Date(),
          },
          {
            name: "Ergonomic Office Chair",
            price: 449.99,
            image: "/placeholder.svg?height=400&width=400",
            description: "Comfortable ergonomic office chair with lumbar support and adjustable height.",
            category: "Furniture",
            stock: 12,
            rating: 4.7,
            reviews: 203,
            tags: ["Popular"],
            approved: true,
            createdAt: new Date(),
          },
          {
            name: "Bluetooth Speaker",
            price: 79.99,
            image: "/placeholder.svg?height=400&width=400",
            description: "Portable Bluetooth speaker with excellent sound quality and long battery life.",
            category: "Electronics",
            discount: 25,
            stock: 20,
            rating: 4.3,
            reviews: 91,
            tags: ["Hot Deal"],
            approved: true,
            createdAt: new Date(),
          },
        ]

        await db.collection("products").insertMany(initialProducts)
      }

      // Check if sessions collection exists
      if (!hasSessions) {
        await db.createCollection("sessions")
        // Create TTL index for session expiration
        await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      }

      // Check if uploads collection exists
      if (!hasUploads) {
        await db.createCollection("uploads")
      }

      await client.close()

      return NextResponse.json({
        success: true,
        message: "MongoDB setup completed successfully",
        collections: {
          products: hasProducts ? "existing" : "created",
          sessions: hasSessions ? "existing" : "created",
          uploads: hasUploads ? "existing" : "created",
        },
      })
    } catch (mongoError) {
      console.error("MongoDB connection error:", mongoError)
      return NextResponse.json({ error: "Failed to connect to MongoDB" }, { status: 500 })
    }
  } catch (error) {
    console.error("MongoDB setup error:", error)
    return NextResponse.json({ error: "Failed to setup MongoDB" }, { status: 500 })
  }
}
