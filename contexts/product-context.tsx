"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Product {
  id: string
  name: string
  price: number
  image: string
  description: string
  category: string
  discount?: number
  stock: number
  rating: number
  reviews: number
  tags: string[]
  approved: boolean
}

interface ProductContextType {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: Omit<Product, "id">) => Promise<Product>
  updateProduct: (id: string, product: Partial<Product>) => Promise<Product>
  deleteProduct: (id: string) => Promise<boolean>
  toggleApproval: (id: string) => Promise<Product>
  getApprovedProducts: () => Product[]
  refreshProducts: () => Promise<void>
  dbStatus: { connected: boolean; error: string | null }
  initializeDatabase: () => Promise<boolean>
}

const ProductContext = createContext<ProductContextType | null>(null)

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error: string | null }>({
    connected: false,
    error: null,
  })
  const { toast } = useToast()

  // Check MongoDB connection status
  const checkDbConnection = async () => {
    try {
      const response = await fetch("/api/db-status")
      if (response.ok) {
        const data = await response.json()
        setDbStatus(data)
        return data.connected
      }
      return false
    } catch (err) {
      console.error("Error checking DB status:", err)
      setDbStatus({ connected: false, error: String(err) })
      return false
    }
  }

  // Initialize database with sample data if empty
  const initializeDatabase = async (): Promise<boolean> => {
    try {
      console.log("Initializing database...")
      const response = await fetch("/api/products/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to initialize database: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Database initialization result:", result)

      if (result.success) {
        await fetchProducts() // Refresh products after initialization
        return true
      }
      return false
    } catch (err) {
      console.error("Error initializing database:", err)
      setError(`Failed to initialize database: ${err instanceof Error ? err.message : String(err)}`)
      return false
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check MongoDB connection first
      const isConnected = await checkDbConnection()

      if (!isConnected) {
        throw new Error("MongoDB is not connected. Please configure your database connection.")
      }

      console.log("Fetching products from MongoDB API")
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Products fetched from API:", data)

      if (Array.isArray(data)) {
        setProducts(data)
        if (data.length === 0) {
          console.log("No products found, database may need initialization")
        }
      } else {
        throw new Error("Invalid response format from products API")
      }
    } catch (err) {
      console.error("Error fetching products:", err)
      setError(`Failed to load products: ${err instanceof Error ? err.message : String(err)}`)
      setProducts([]) // Clear products on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const addProduct = async (product: Omit<Product, "id">): Promise<Product> => {
    try {
      if (!dbStatus.connected) {
        throw new Error("Database is not connected. Cannot add product.")
      }

      console.log("Adding product to database:", product)
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to add product: ${response.status} ${response.statusText}`)
      }

      const newProduct = await response.json()
      console.log("Product added to database:", newProduct)

      // Update local state
      setProducts((prev) => [...prev, newProduct])

      if (toast) {
        toast({
          title: "Product added",
          description: "Product has been successfully added to the database.",
        })
      }

      return newProduct
    } catch (err) {
      console.error("Error adding product:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to add product: ${errorMessage}`)

      if (toast) {
        toast({
          title: "Error adding product",
          description: errorMessage,
          variant: "destructive",
        })
      }

      throw err
    }
  }

  const updateProduct = async (id: string, updatedFields: Partial<Product>): Promise<Product> => {
    try {
      if (!dbStatus.connected) {
        throw new Error("Database is not connected. Cannot update product.")
      }

      console.log("Updating product in database:", id, updatedFields)
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update product: ${response.status} ${response.statusText}`)
      }

      const updatedProduct = await response.json()
      console.log("Product updated in database:", updatedProduct)

      // Update local state
      setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, ...updatedProduct } : product)))

      if (toast) {
        toast({
          title: "Product updated",
          description: "Product has been successfully updated in the database.",
        })
      }

      return updatedProduct
    } catch (err) {
      console.error("Error updating product:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to update product: ${errorMessage}`)

      if (toast) {
        toast({
          title: "Error updating product",
          description: errorMessage,
          variant: "destructive",
        })
      }

      throw err
    }
  }

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      if (!dbStatus.connected) {
        throw new Error("Database is not connected. Cannot delete product.")
      }

      console.log("Deleting product from database:", id)
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete product: ${response.status} ${response.statusText}`)
      }

      console.log("Product deleted from database:", id)

      // Update local state
      setProducts((prev) => prev.filter((product) => product.id !== id))

      if (toast) {
        toast({
          title: "Product deleted",
          description: "Product has been successfully deleted from the database.",
        })
      }

      return true
    } catch (err) {
      console.error("Error deleting product:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to delete product: ${errorMessage}`)

      if (toast) {
        toast({
          title: "Error deleting product",
          description: errorMessage,
          variant: "destructive",
        })
      }

      throw err
    }
  }

  const toggleApproval = async (id: string): Promise<Product> => {
    const product = products.find((p) => p.id === id)
    if (!product) {
      throw new Error("Product not found")
    }

    return updateProduct(id, { approved: !product.approved })
  }

  const getApprovedProducts = () => {
    return products.filter((product) => product.approved)
  }

  const refreshProducts = async () => {
    await fetchProducts()
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleApproval,
        getApprovedProducts,
        refreshProducts,
        dbStatus,
        initializeDatabase,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider")
  }
  return context
}
