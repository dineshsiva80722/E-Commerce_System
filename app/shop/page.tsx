"use client"

import { useState, useMemo, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { CartSidebar } from "@/components/cart-sidebar"
import { ProductModal } from "@/components/product-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Filter, Star, ShoppingCart, AlertCircle, Loader2, Database, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useProducts, type Product } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"

export default function ShopPage() {
  const { getApprovedProducts, refreshProducts, loading, error, dbStatus, initializeDatabase } = useProducts()
  const { addToCart } = useCart()
  const products = useProducts().products

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [showDiscountOnly, setShowDiscountOnly] = useState(false)
  const [sortBy, setSortBy] = useState("name")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  // Handle database initialization
  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    try {
      const success = await initializeDatabase()
      if (success) {
        await refreshProducts()
      }
    } catch (err) {
      console.error("Failed to initialize database:", err)
    } finally {
      setIsInitializing(false)
    }
  }

  // Auto-refresh products when database becomes available
  useEffect(() => {
    if (dbStatus.connected && products.length === 0 && !loading) {
      refreshProducts()
    }
  }, [dbStatus.connected, products.length, loading, refreshProducts])

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.category)))
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    // If no filters are applied, show all products
    if (!searchQuery && selectedCategories.length === 0 && priceRange[0] === 0 && priceRange[1] === 1000 && !showDiscountOnly) {
      return [...products].sort((a, b) => {
        switch (sortBy) {
          case "price-low":
            return a.price - b.price
          case "price-high":
            return b.price - a.price
          case "rating":
            return b.rating - a.rating
          case "newest":
            return b.createdAt - a.createdAt
          case "name":
          default:
            return a.name.localeCompare(b.name)
        }
      })
    }
  
    // Otherwise apply filters
    const filtered = products.filter((product) => {
      const matchesSearch =
        !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
  
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
  
      const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price
      const matchesPrice = priceRange[0] === 0 && priceRange[1] === 1000 || 
                          (discountedPrice >= priceRange[0] && discountedPrice <= priceRange[1])
  
      const matchesDiscount = !showDiscountOnly || product.discount
  
      return matchesSearch && matchesCategory && matchesPrice && matchesDiscount
    })
  
    // Sort filtered products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          const priceA = a.discount ? a.price * (1 - a.discount / 100) : a.price
          const priceB = b.discount ? b.price * (1 - b.discount / 100) : b.price
          return priceA - priceB
        case "price-high":
          const priceA2 = a.discount ? a.price * (1 - a.discount / 100) : a.price
          const priceB2 = b.discount ? b.price * (1 - b.discount / 100) : b.price
          return priceB2 - priceA2
        case "rating":
          return b.rating - a.rating
        case "newest":
          return b.createdAt - a.createdAt
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })
  
    return filtered
  }, [products, searchQuery, selectedCategories, priceRange, showDiscountOnly, sortBy])

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories((prev) => [...prev, category])
    } else {
      setSelectedCategories((prev) => prev.filter((c) => c !== category))
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      discount: product.discount,
    })
  }

  const getRelatedProducts = (product: Product) => {
    return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  }

  // Database connection error state
  if (!dbStatus.connected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <CartSidebar />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Database className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Database Connection Required</h1>
            <p className="text-muted-foreground mb-8">
              This application requires a MongoDB database connection to display products. Please configure your
              database to continue.
            </p>

            {dbStatus.error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{dbStatus.error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-center">
              <Button asChild>
                <a href="/setup">Setup Database</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Go Home</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CartSidebar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Shop</h1>
          <p className="text-muted-foreground">Discover our amazing collection of products</p>
        </div>

        {/* Database Status Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={refreshProducts}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                {products.length === 0 && (
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
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-5 w-5" />
                  <h2 className="font-semibold text-lg">Filters</h2>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-3 block">Categories</label>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                          />
                          <label htmlFor={category} className="text-sm cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <label className="text-sm font-medium mb-3 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={1000} step={10} className="w-full" />
                </div>

                {/* Discount Filter */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="discount" checked={showDiscountOnly} onCheckedChange={setShowDiscountOnly} />
                    <label htmlFor="discount" className="text-sm cursor-pointer">
                      Show discounted items only
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategories([])
                    setPriceRange([0, 1000])
                    setShowDiscountOnly(false)
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="flex gap-4 items-center">
                <Button variant="outline" size="sm" onClick={refreshProducts} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
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
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price (Low to High)</SelectItem>
                    <SelectItem value="price-high">Price (High to Low)</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg">Loading products from database...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                {products.length === 0 ? (
                  <div>
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">No products found in database</p>
                    <Button onClick={handleInitializeDatabase} disabled={isInitializing}>
                      {isInitializing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Initializing Database...
                        </>
                      ) : (
                        <>
                          <Database className="h-4 w-4 mr-2" />
                          Initialize Database with Sample Products
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-lg">No products found matching your criteria</p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const discountedPrice = product.discount
                    ? product.price * (1 - product.discount / 100)
                    : product.price

                  return (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-0">
                        <div
                          className="aspect-square relative overflow-hidden rounded-t-lg cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
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
                          <h3
                            className="font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                            onClick={() => handleProductClick(product)}
                          >
                            {product.name}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{product.description}</p>

                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-primary">${discountedPrice.toFixed(2)}</span>
                              {product.discount && (
                                <span className="text-sm text-muted-foreground line-through">
                                  ${product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{product.rating}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock === 0}
                            className="w-full"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedProducts={selectedProduct ? getRelatedProducts(selectedProduct) : []}
      />
    </div>
  )
}
