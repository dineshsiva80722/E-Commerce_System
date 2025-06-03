"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProducts, type Product } from "@/contexts/product-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FileUpload } from "@/components/file-upload"
import Link from "next/link"
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  Package,
  Eye,
  EyeOff,
  BarChart3,
  ShoppingCart,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle,
  Database,
  RefreshCw,
} from "lucide-react"
import Image from "next/image"

export default function AdminDashboard() {
  const { isAuthenticated, logout, loading: authLoading } = useAuth()
  const {
    products,
    loading: productsLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleApproval,
    getApprovedProducts,
    refreshProducts,
    dbStatus,
    initializeDatabase,
    error: productsError,
  } = useProducts()
  const { toast } = useToast()
  const router = useRouter()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/admin")
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Handle database initialization
  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    try {
      const success = await initializeDatabase()
      if (success) {
        await refreshProducts()
        toast({
          title: "Database initialized",
          description: "Sample products have been added to the database.",
        })
      }
    } catch (err) {
      console.error("Failed to initialize database:", err)
      toast({
        title: "Initialization failed",
        description: "Failed to initialize database with sample products.",
        variant: "destructive",
      })
    } finally {
      setIsInitializing(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/admin")
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
        toast({
          title: "Product deleted",
          description: "The product has been successfully deleted.",
        })
      } catch (err) {
        toast({
          title: "Delete failed",
          description: "Failed to delete the product.",
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleApproval = async (id: string) => {
    try {
      await toggleApproval(id)
      toast({
        title: "Product status updated",
        description: "The product visibility has been updated.",
      })
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Failed to update product status.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshProducts()
      toast({
        title: "Products refreshed",
        description: "The product list has been refreshed from the database.",
      })
    } catch (err) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh products from database.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "price":
        return a.price - b.price
      case "category":
        return a.category.localeCompare(b.category)
      case "stock":
        return b.stock - a.stock
      default:
        return 0
    }
  })

  const stats = {
    total: products.length,
    approved: getApprovedProducts().length,
    hidden: products.filter((p) => !p.approved).length,
    lowStock: products.filter((p) => p.stock < 10).length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-2xl font-bold">CMS Dashboard</h1>
                <p className="text-muted-foreground">Manage your products and inventory</p>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/">
                    <Package className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/shop">
                    <Eye className="h-4 w-4 mr-2" />
                    Shop
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile Navigation */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Package className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col space-y-4 mt-8">
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/">
                          <Package className="h-4 w-4 mr-2" />
                          Home
                        </Link>
                      </Button>
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/shop">
                          <Eye className="h-4 w-4 mr-2" />
                          Shop
                        </Link>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Database Status */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dbStatus.connected ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">MongoDB Connected</span>
                      <span className="text-muted-foreground">({products.length} products loaded)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span className="text-destructive font-medium">MongoDB Not Connected</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {!dbStatus.connected && (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/setup">Setup Database</a>
                    </Button>
                  )}
                  {dbStatus.connected && products.length === 0 && (
                    <Button variant="outline" size="sm" onClick={handleInitializeDatabase} disabled={isInitializing}>
                      {isInitializing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Initialize Database
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              {dbStatus.error && <p className="text-sm text-destructive mt-2">{dbStatus.error}</p>}
              {productsError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{productsError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hidden</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.hidden}</p>
                </div>
                <EyeOff className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Products Management</CardTitle>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || !dbStatus.connected}>
                  {isRefreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="stock">Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!dbStatus.connected}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      onSubmit={async (productData) => {
                        try {
                          await addProduct(productData)
                          setIsAddModalOpen(false)
                          toast({
                            title: "Product added",
                            description: "The product has been successfully added.",
                          })
                        } catch (err) {
                          toast({
                            title: "Add failed",
                            description: "Failed to add the product.",
                            variant: "destructive",
                          })
                        }
                      }}
                      onCancel={() => setIsAddModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!dbStatus.connected ? (
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">Database connection required</p>
                <Button asChild>
                  <a href="/setup">Setup Database Connection</a>
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No products found in database</p>
                <Button onClick={handleInitializeDatabase} disabled={isInitializing}>
                  {isInitializing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Initializing Database...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Initialize with Sample Products
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>${product.price.toFixed(2)}</span>
                            {product.discount && (
                              <Badge variant="destructive" className="text-xs">
                                -{product.discount}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                          >
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {product.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={product.approved}
                            onCheckedChange={() => handleToggleApproval(product.id)}
                            disabled={!dbStatus.connected}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setEditingProduct(product)
                                setIsEditModalOpen(true)
                              }}
                              disabled={!dbStatus.connected}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-destructive hover:text-destructive"
                              disabled={!dbStatus.connected}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={async (productData) => {
                try {
                  await updateProduct(editingProduct.id, productData)
                  setIsEditModalOpen(false)
                  setEditingProduct(null)
                  toast({
                    title: "Product updated",
                    description: "The product has been successfully updated.",
                  })
                } catch (err) {
                  toast({
                    title: "Update failed",
                    description: "Failed to update the product.",
                    variant: "destructive",
                  })
                }
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setEditingProduct(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: Omit<Product, "id">) => Promise<void>
  onCancel: () => void
}

function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price || 0,
    image: initialData?.image || "/placeholder.svg?height=400&width=400",
    description: initialData?.description || "",
    category: initialData?.category || "",
    discount: initialData?.discount || 0,
    stock: initialData?.stock || 0,
    rating: initialData?.rating || 4.0,
    reviews: initialData?.reviews || 0,
    tags: initialData?.tags?.join(", ") || "",
    approved: initialData?.approved ?? true,
  })

  // Add this preview product object
  const previewProduct: Product = {
    id: "preview",
    name: formData.name || "Product Name",
    price: formData.price || 0,
    image: formData.image || "/placeholder.svg?height=400&width=400",
    description: formData.description || "Product description will appear here...",
    category: formData.category || "Category",
    discount: formData.discount || 0,
    stock: formData.stock || 0,
    rating: formData.rating || 4.0,
    reviews: formData.reviews || 0,
    tags: formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
    approved: formData.approved,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = formData.image

      // If there's a file selected, upload it first
      if (selectedFile) {
        const uploadData = new FormData()
        uploadData.append("file", selectedFile)

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          })

          if (response.ok) {
            const data = await response.json()
            imageUrl = data.url
          }
        } catch (error) {
          console.error("Error uploading image:", error)
          // Continue with existing image URL if upload fails
        }
      }

      const productData = {
        ...formData,
        image: imageUrl,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      }

      await onSubmit(productData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    "Electronics",
    "Clothing",
    "Furniture",
    "Photography",
    "Wearables",
    "Books",
    "Sports",
    "Home & Garden",
    "Lifestyle",
  ]

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price ($)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Discount (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => setFormData((prev) => ({ ...prev, discount: Number.parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stock</label>
            <Input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number.parseInt(e.target.value) || 0 }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Image</label>
          <FileUpload
            onFileChange={setSelectedFile}
            onUrlChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            initialUrl={formData.image}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <Input
            value={formData.tags}
            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
            placeholder="Popular, Hot Deal, New"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number.parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Reviews Count</label>
            <Input
              type="number"
              min="0"
              value={formData.reviews}
              onChange={(e) => setFormData((prev) => ({ ...prev, reviews: Number.parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.approved}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, approved: checked }))}
          />
          <label className="text-sm font-medium">Approved (visible in shop)</label>
        </div>

        {/* Update the button section to include Preview button */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {initialData ? "Updating..." : "Adding..."}
                </>
              ) : initialData ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Add Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Product Preview</DialogTitle>
            <p className="text-sm text-muted-foreground">This is how your product will appear in the shop</p>
          </DialogHeader>

          <div className="mt-4">
            <ProductPreviewCard product={previewProduct} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Add this new component after the ProductForm component
function ProductPreviewCard({ product }: { product: Product }) {
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price

  return (
    <Card className="group hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount && (
            <Badge className="absolute top-4 left-4" variant="destructive">
              -{product.discount}%
            </Badge>
          )}
          <div className="absolute top-4 right-4">
            {product.tags.slice(0, 1).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">${discountedPrice.toFixed(2)}</span>
              {product.discount && (
                <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{product.rating}</span>
            </div>
          </div>

          <Button className="w-full" disabled={product.stock === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
