"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  bio?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updatedUser: User) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage or a cookie
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    // Simulate API call for login
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email === "user@example.com" && password === "password") {
          const loggedInUser: User = {
            id: "1",
            name: "John Doe",
            email: "user@example.com",
            role: "Applicant",
            avatar: "/placeholder.svg?height=100&width=100",
            bio: "Passionate software engineer looking for new opportunities.",
          }
          setUser(loggedInUser)
          setIsAuthenticated(true)
          localStorage.setItem("currentUser", JSON.stringify(loggedInUser))
          toast({
            title: "Logged In!",
            description: "Welcome back, John Doe.",
          })
          resolve()
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid email or password.",
            variant: "destructive",
          })
          reject(new Error("Invalid credentials"))
        }
        setLoading(false)
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const updateUser = async (updatedUser: User) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUser(updatedUser)
        localStorage.setItem("currentUser", JSON.stringify(updatedUser))
        resolve()
      }, 500)
    })
  }

  if (loading) {
    return null // Or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
