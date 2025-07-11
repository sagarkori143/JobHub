"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase" // Import the Supabase client
import { AuthApiError } from "@supabase/supabase-js"
import type { User } from "@/types/job-search" // Import User type from job-search.ts
import type { User as SupabaseUser } from "@supabase/supabase-js"

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

// Define a more detailed return type for the login function
interface LoginResult {
  success: boolean
  message?: string
  errorType?: "wrong_password" | "email_not_found" | "other_error" | "rate_limit" | "invalid_credentials"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  jobPreferences: JobPreferences
  login: (email: string, password: string) => Promise<LoginResult> // Updated return type
  signup: (
    name: string,
    email: string,
    password: string,
    gender: string,
  ) => Promise<{ success: boolean; message?: string }> // Updated return type for signup
  verifyEmailOtp: (email: string, token: string) => Promise<{ success: boolean; message?: string }> // New OTP verification for signup
  sendPasswordResetOtp: (email: string) => Promise<{ success: boolean; message?: string }> // New OTP send for password reset
  verifyPasswordResetOtp: (
    email: string,
    token: string,
    newPassword?: string,
  ) => Promise<{ success: boolean; message?: string }> // New OTP verification for password reset
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  updateJobPreferences: (preferences: JobPreferences) => Promise<void>
  loading: boolean
  supabaseUser: SupabaseUser | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
  const [loading, setLoading] = useState(true)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)

  const fetchUserProfile = useCallback(async (id: string) => {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.error("Error fetching user profile:", error)
      return null
    }

    if (data) {
      return {
        id: data.id,
        name: data.full_name || data.email.split("@")[0],
        email: data.email,
        avatar: data.avatar_url,
        role: data.role,
        joinedDate: data.joined_date,
        gender: data.gender, // Include gender
        jobPreferences: data.job_preferences || defaultJobPreferences,
      }
    }
    return null
  }, [])

  const createOrUpdateUserProfile = useCallback(
    async (supabaseUser: SupabaseUser, preferences: JobPreferences, name?: string, gender?: string) => {
      const profilePayload: Record<string, unknown> = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        role: supabaseUser.user_metadata?.role || "User",
        joined_date: new Date().toISOString().split("T")[0],
        job_preferences: preferences,
      }

      // Only include gender if we actually have a value **and** the column exists.
      if (gender) {
        profilePayload.gender = gender
      }

      const { data, error } = await supabase.from("user_profiles").upsert(profilePayload, { onConflict: "id" }).select()

      if (error) {
        console.error("Error creating/updating user profile:", error)
        return null
      }
      return data ? data[0] : null
    },
    [],
  )

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true)
      if (session?.user) {
        setSupabaseUser(session.user)
        const profile = await fetchUserProfile(session.user.id)
        if (profile) {
          setUser(profile)
          setJobPreferences(profile.jobPreferences)
        } else {
          // If no profile exists, create one with default preferences
          const newProfile = await createOrUpdateUserProfile(session.user, defaultJobPreferences)
          if (newProfile) {
            setUser({
              id: newProfile.id,
              name: newProfile.full_name || newProfile.email.split("@")[0],
              email: newProfile.email,
              avatar: newProfile.avatar_url,
              role: newProfile.role,
              joinedDate: newProfile.joined_date,
              gender: newProfile.gender, // Include gender
              jobPreferences: newProfile.job_preferences,
            })
            setJobPreferences(newProfile.job_preferences)
          }
        }
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setSupabaseUser(null)
        setIsAuthenticated(false)
        setJobPreferences(defaultJobPreferences) // Reset to default on logout
      }
      setLoading(false)
    })

    // Initial check for session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        const profile = await fetchUserProfile(session.user.id)
        if (profile) {
          setUser(profile)
          setJobPreferences(profile.jobPreferences)
        } else {
          const newProfile = await createOrUpdateUserProfile(session.user, defaultJobPreferences)
          if (newProfile) {
            setUser({
              id: newProfile.id,
              name: newProfile.full_name || newProfile.email.split("@")[0],
              email: newProfile.email,
              avatar: newProfile.avatar_url,
              role: newProfile.role,
              joinedDate: newProfile.joined_date,
              gender: newProfile.gender, // Include gender
              jobPreferences: newProfile.job_preferences,
            })
            setJobPreferences(newProfile.job_preferences)
          }
        }
        setIsAuthenticated(true)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [fetchUserProfile, createOrUpdateUserProfile])

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signInData?.user) {
      return { success: true, message: "You have successfully signed in." }
    }

    // Always show a generic error for failed login
    return {
      success: false,
      message: "Invalid email or password.",
      errorType: "invalid_credentials",
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    gender: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true)
    // Use signInWithOtp for signup to send OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          full_name: name,
          gender: gender,
          password: password, // Store password in metadata for later use if needed, or handle separately
        },
        shouldCreateUser: true, // Allow creating user if not exists
      },
    })

    if (error) {
      console.error("Sign-up OTP send error:", error.message)
      setLoading(false)
      if (
        error instanceof AuthApiError &&
        error.status === 400 &&
        error.message?.toLowerCase().includes("user already registered")
      ) {
        return { success: false, message: "An account with this email already exists. Please log in." }
      }
      return { success: false, message: error.message || "Failed to send OTP for signup." }
    }

    setLoading(false)
    return { success: true, message: "OTP sent to your email. Please verify to complete signup." }
  }

  const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true)
    const {
      data: { user: supabaseUser, session },
      error,
    } = await supabase.auth.verifyOtp({ email, token, type: "signup" })

    if (error) {
      console.error("OTP verification error:", error.message)
      setLoading(false)
      return { success: false, message: error.message || "OTP verification failed." }
    }

    if (supabaseUser && session) {
      // If OTP is verified, now set the password if it was passed in metadata during signup
      // This is a workaround as signInWithOtp doesn't set password directly.
      // A more robust solution might involve a server function or a separate password setting step.
      const { password, ...metadata } = supabaseUser.user_metadata || {}
      if (password) {
        const { error: updateError } = await supabase.auth.updateUser({ password: password })
        if (updateError) {
          console.error("Error setting password after OTP verification:", updateError.message)
          // Continue, but log the error. User might need to reset password later.
        }
      }

      // Profile creation/update is handled by onAuthStateChange listener
      setLoading(false)
      return { success: true, message: "Account verified successfully!" }
    }

    setLoading(false)
    return { success: false, message: "OTP verification failed." }
  }

  const sendPasswordResetOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        channel: "email",
        shouldCreateUser: false, // Do not create user for password reset flow
      },
    })

    if (error) {
      console.error("Password reset OTP send error:", error.message)
      setLoading(false)
      if (
        error instanceof AuthApiError &&
        error.status === 400 &&
        error.message?.toLowerCase().includes("user not found")
      ) {
        return { success: false, message: "No account found with this email." }
      }
      return { success: false, message: error.message || "Failed to send password reset OTP." }
    }

    setLoading(false)
    return { success: true, message: "Password reset OTP sent to your email." }
  }

  const verifyPasswordResetOtp = async (
    email: string,
    token: string,
    newPassword?: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true)
    const {
      data: { user: supabaseUser, session },
      error,
    } = await supabase.auth.verifyOtp({ email, token, type: "recovery" })

    if (error) {
      console.error("Password reset OTP verification error:", error.message)
      setLoading(false)
      return { success: false, message: error.message || "OTP verification failed." }
    }

    if (supabaseUser && session && newPassword) {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        console.error("Error updating password after OTP verification:", updateError.message)
        setLoading(false)
        return { success: false, message: updateError.message || "Failed to set new password." }
      }
      setLoading(false)
      return { success: true, message: "Password reset successfully!" }
    }

    setLoading(false)
    return { success: false, message: "OTP verification failed or new password not provided." }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/personal", // Redirect back to the personal dashboard
      },
    })

    if (error) {
      console.error("Google sign-in error:", error.message)
      setLoading(false)
      throw error // Re-throw to be caught by the component
    }
    // No need to set loading to false here, as Supabase will redirect the user
  }

  const logout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    if (error) {
      console.error("Logout error:", error.message)
    }
    // State reset is handled by onAuthStateChange
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user || !supabaseUser) return

    setLoading(true)

    const updatePayload: Record<string, unknown> = {
      full_name: updates.name,
      avatar_url: updates.avatar,
      role: updates.role,
    }

    if (updates.gender) {
      updatePayload.gender = updates.gender
    }

    const { data, error } = await supabase.from("user_profiles").update(updatePayload).eq("id", user.id).select()

    setLoading(false)
    if (error) {
      console.error("Error updating profile:", error.message)
    } else if (data && data[0]) {
      setUser((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const updateJobPreferences = async (preferences: JobPreferences) => {
    if (!user || !supabaseUser) return

    setLoading(true)
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ job_preferences: preferences })
      .eq("id", user.id)
      .select()

    setLoading(false)
    if (error) {
      console.error("Error updating job preferences:", error.message)
    } else if (data && data[0]) {
      setJobPreferences(preferences)
      setUser((prev) => (prev ? { ...prev, jobPreferences: preferences } : null))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        jobPreferences,
        login,
        signup,
        verifyEmailOtp,
        sendPasswordResetOtp,
        verifyPasswordResetOtp,
        loginWithGoogle,
        logout,
        updateProfile,
        updateJobPreferences,
        loading,
        supabaseUser,
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
