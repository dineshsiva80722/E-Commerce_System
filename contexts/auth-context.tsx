"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (process.env.NEXT_PUBLIC_HAS_MONGODB) {
          // Check session with API
          const response = await fetch("/api/auth/session")
          const data = await response.json()
          setIsAuthenticated(data.isAuthenticated)
        } else {
          // Fallback to localStorage
          const authStatus = localStorage.getItem("isAuthenticated")
          setIsAuthenticated(authStatus === "true")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // Fallback to localStorage
        const authStatus = localStorage.getItem("isAuthenticated")
        setIsAuthenticated(authStatus === "true")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (process.env.NEXT_PUBLIC_HAS_MONGODB) {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        if (!response.ok) {
          return false
        }

        setIsAuthenticated(true)
        return true
      } else {
        // Simple authentication for demo
        if (username === "admin" && password === "password") {
          setIsAuthenticated(true)
          localStorage.setItem("isAuthenticated", "true")
          return true
        }
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      if (process.env.NEXT_PUBLIC_HAS_MONGODB) {
        await fetch("/api/auth", {
          method: "DELETE",
        })
      } else {
        localStorage.removeItem("isAuthenticated")
      }

      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout error:", error)
      // Fallback
      localStorage.removeItem("isAuthenticated")
      setIsAuthenticated(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
