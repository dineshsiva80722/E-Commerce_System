"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/contexts/product-context"
import { useCart } from "@/contexts/cart-context"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  relatedProducts: Product[]
}

export function ProductModal({ product, isOpen, onClose, relatedProducts }: ProductModalProps) {
  const { addToCart } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) return null

  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      discount: product.discount,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg border">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            {/* Thumbnail images would go here in a real app */}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">${discountedPrice.toFixed(2)}</span>
                  {product.discount && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                      <Badge variant="destructive">-{product.discount}%</Badge>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <p className="text-muted-foreground mb-6">{product.description}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Stock:</span>
                  <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                    {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                  </Badge>
                </div>

                <Button onClick={handleAddToCart} disabled={product.stock === 0} className="w-full" size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Related Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <div key={relatedProduct.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square relative mb-2 overflow-hidden rounded">
                    <Image
                      src={relatedProduct.image || "/placeholder.svg"}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-2">{relatedProduct.name}</h4>
                  <p className="text-sm font-semibold text-primary">
                    $
                    {relatedProduct.discount
                      ? (relatedProduct.price * (1 - relatedProduct.discount / 100)).toFixed(2)
                      : relatedProduct.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
