import { NextResponse } from "next/server"

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
  },
  {
    name: "Gaming Mechanical Keyboard",
    price: 159.99,
    image: "/placeholder.svg?height=400&width=400",
    description: "RGB backlit mechanical keyboard with tactile switches for gaming and productivity.",
    category: "Electronics",
    discount: 12,
    stock: 18,
    rating: 4.5,
    reviews: 78,
    tags: ["Gaming", "RGB"],
    approved: true,
  },
  {
    name: "Stainless Steel Water Bottle",
    price: 24.99,
    image: "/placeholder.svg?height=400&width=400",
    description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours.",
    category: "Lifestyle",
    stock: 35,
    rating: 4.6,
    reviews: 142,
    tags: ["Eco-Friendly", "Insulated"],
    approved: true,
  },
  {
    name: "Wireless Charging Pad",
    price: 39.99,
    image: "/placeholder.svg?height=400&width=400",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
    category: "Electronics",
    discount: 8,
    stock: 22,
    rating: 4.2,
    reviews: 95,
    tags: ["Wireless", "Fast Charging"],
    approved: true,
  },
  {
    name: "Yoga Mat Premium",
    price: 79.99,
    image: "/placeholder.svg?height=400&width=400",
    description: "Non-slip premium yoga mat with excellent cushioning and durability.",
    category: "Sports",
    stock: 14,
    rating: 4.7,
    reviews: 186,
    tags: ["Premium", "Non-slip"],
    approved: true,
  },
]

export async function POST() {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB not configured" }, { status: 500 })
    }

    console.log("Initializing products database...")

    // Dynamic import to avoid build issues
    const { default: clientPromise } = await import("@/lib/mongodb")
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if products already exist
    const existingCount = await db.collection("products").countDocuments()

    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} products`)
      return NextResponse.json({
        success: true,
        message: `Database already initialized with ${existingCount} products`,
        productsCount: existingCount,
        action: "skipped",
      })
    }

    // Insert initial products
    const productsWithTimestamp = initialProducts.map((product) => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    const result = await db.collection("products").insertMany(productsWithTimestamp)

    console.log(`Inserted ${result.insertedCount} products into database`)

    return NextResponse.json({
      success: true,
      message: `Successfully initialized database with ${result.insertedCount} products`,
      productsCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds).map((id) => id.toString()),
      action: "initialized",
    })
  } catch (error) {
    console.error("Error initializing products database:", error)
    return NextResponse.json(
      {
        error: `Failed to initialize products database: ${String(error)}`,
      },
      { status: 500 },
    )
  }
}
