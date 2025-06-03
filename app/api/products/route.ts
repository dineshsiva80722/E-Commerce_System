import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB not configured. Please set up your database connection." },
        { status: 500 },
      )
    }

    console.log("API: Fetching products from MongoDB")

    // Dynamic import to avoid build issues with Bun
    const clientPromise = (await import("@/lib/mongodb")).default
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Fetch all products, sorted by creation date (newest first)
    const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray()

    console.log(`API: Found ${products.length} products in MongoDB`)

    // Transform MongoDB documents to include string IDs
    const transformedProducts = products.map((product) => ({
      ...product,
      id: product._id.toString(),
      _id: undefined, // Remove the MongoDB _id object
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error("API: Database error fetching products:", error)
    return NextResponse.json(
      {
        error: `Failed to fetch products from database: ${String(error)}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "MongoDB not configured. Please set up your database connection." },
        { status: 500 },
      )
    }

    const product = await request.json()
    console.log("API: Adding new product to MongoDB:", product)

    // Validate required fields
    const requiredFields = ["name", "price", "description", "category", "stock"]
    for (const field of requiredFields) {
      if (!product[field] && product[field] !== 0) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Dynamic import to avoid build issues with Bun
    const clientPromise = (await import("@/lib/mongodb")).default
    const client = await clientPromise
    const db = client.db("ecommerce")

    const productToInsert = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ensure default values
      rating: product.rating || 4.0,
      reviews: product.reviews || 0,
      tags: product.tags || [],
      approved: product.approved !== undefined ? product.approved : true,
      discount: product.discount || 0,
    }

    const result = await db.collection("products").insertOne(productToInsert)

    console.log("API: Product added to MongoDB with ID:", result.insertedId)

    const newProduct = {
      ...productToInsert,
      id: result.insertedId.toString(),
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("API: Database error creating product:", error)
    return NextResponse.json(
      {
        error: `Failed to create product: ${String(error)}`,
      },
      { status: 500 },
    )
  }
}
