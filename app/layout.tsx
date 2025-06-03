import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { ProductProvider } from "@/contexts/product-context"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Dezprox E-Commerce System",
  description: "Dezprox E-Commerce System is a comprehensive E-Commerce system with barcode scanning, inventory management, customer tracking, and detailed sales reports. It is designed to help small to medium-sized supermarkets manage their sales, inventory, and customer data efficiently.",
    icons:{
      icon: '/dezproxlogo.png',
      shortcut: '/dezproxlogo.png',
      apple: '/dezproxlogo.png',
    }

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
