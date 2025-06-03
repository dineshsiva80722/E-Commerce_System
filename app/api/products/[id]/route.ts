import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB not configured" }, { status: 500 })
    }

    const id = params.id
    console.log("API: Fetching product with ID:", id)

    // Dynamic imports to avoid build issues with Bun
    const { ObjectId } = await import("mongodb")
    const clientPromise = (await import("@/lib/mongodb")).default
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if the ID is a valid ObjectId
    let objectId: any
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      console.error("API: Invalid ObjectId:", id)
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const product = await db.collection("products").findOne({ _id: objectId })

    if (!product) {
      console.log("API: Product not found with ID:", id)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("API: Found product:", product)
    return NextResponse.json({
      ...product,
      id: product._id.toString(),
    })
  } catch (error) {
    console.error("API: Database error fetching product:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB not configured" }, { status: 500 })
    }

    const id = params.id
    const updates = await request.json()
    console.log("API: Updating product with ID:", id, "Updates:", updates)

    // Dynamic imports to avoid build issues with Bun
    const { ObjectId } = await import("mongodb")
    const clientPromise = (await import("@/lib/mongodb")).default
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if the ID is a valid ObjectId
    let objectId: any
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      console.error("API: Invalid ObjectId:", id)
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const result = await db
      .collection("products")
      .updateOne({ _id: objectId }, { $set: { ...updates, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      console.log("API: Product not found for update with ID:", id)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("API: Product updated successfully:", id)

    // Fetch the updated product to return
    const updatedProduct = await db.collection("products").findOne({ _id: objectId })

    return NextResponse.json({
      ...updatedProduct,
      id: updatedProduct?._id.toString(),
    })
  } catch (error) {
    console.error("API: Database error updating product:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Check if MongoDB is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "MongoDB not configured" }, { status: 500 })
    }

    const id = params.id
    console.log("API: Deleting product with ID:", id)

    // Dynamic imports to avoid build issues with Bun
    const { ObjectId } = await import("mongodb")
    const clientPromise = (await import("@/lib/mongodb")).default
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if the ID is a valid ObjectId
    let objectId: any
    try {
      objectId = new ObjectId(id)
    } catch (error) {
      console.error("API: Invalid ObjectId:", id)
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const result = await db.collection("products").deleteOne({ _id: objectId })

    if (result.deletedCount === 0) {
      console.log("API: Product not found for deletion with ID:", id)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    console.log("API: Product deleted successfully:", id)
    return NextResponse.json({ id, deleted: true })
  } catch (error) {
    console.error("API: Database error deleting product:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
