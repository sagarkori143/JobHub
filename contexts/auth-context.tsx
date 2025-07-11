"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  joinedDate: string
}

interface JobPreferences {
  keywords: string[]
  industries: string[]
  locations: string[]
  jobTypes: string[]
  experienceLevels: string[]
  salaryRange: {
    min: number
    max: number
  }
  notifications: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  jobPreferences: JobPreferences
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  updateJobPreferences: (preferences: JobPreferences) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Updated mock user data with your details
const mockUser: User = {
  id: "1",
  name: "Sagar Kori",
  email: "sagar@gmail.com",
  avatar:
    "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
  role: "Software Engineer",
  joinedDate: "2023-01-15",
}

const defaultJobPreferences: JobPreferences = {
  keywords: ["React", "JavaScript", "Frontend"],
  industries: ["Technology"],
  locations: ["Remote", "San Francisco"],
  jobTypes: ["Full-time"],
  experienceLevels: ["Mid", "Senior"],
  salaryRange: {
    min: 80000,
    max: 150000,
  },
  notifications: {
    email: true,
    sms: false,
    whatsapp: false,
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [jobPreferences, setJobPreferences] = useState<JobPreferences>(defaultJobPreferences)

  useEffect(() => {
    // Check if user is logged in (in real app, check localStorage/cookies)
    const savedUser = localStorage.getItem("user")
    const savedPreferences = localStorage.getItem("jobPreferences")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }

    if (savedPreferences) {
      setJobPreferences(JSON.parse(savedPreferences))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Updated login credentials
    if (email === "sagar@gmail.com" && password === "sagarkori") {
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("user", JSON.stringify(mockUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("user")
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const updateJobPreferences = (preferences: JobPreferences) => {
    setJobPreferences(preferences)
    localStorage.setItem("jobPreferences", JSON.stringify(preferences))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        jobPreferences,
        login,
        logout,
        updateProfile,
        updateJobPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
