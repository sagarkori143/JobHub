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
  companies: string[]
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
  uploadAvatar: (file: File) => Promise<void>
  removeAvatar: () => Promise<void>
  loading: boolean
  supabaseUser: SupabaseUser | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultJobPreferences: JobPreferences = {
  keywords: ["React", "JavaScript", "Frontend"],
  industries: ["Technology"],
  companies: [],
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

  // Hydrate user from localStorage on initial load and handle auth state changes
  useEffect(() => {
    console.log("🔍 Auth useEffect: Checking localStorage for cached user");
    const cached = typeof window !== 'undefined' ? localStorage.getItem("jobhub_user") : null;
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        console.log("✅ Auth useEffect: Found cached user:", parsed);
        setUser(parsed);
        setIsAuthenticated(true);
        if (parsed.jobPreferences) {
          setJobPreferences(parsed.jobPreferences);
          console.log("✅ Auth useEffect: Set job preferences from cache");
        }
      } catch (error) {
        console.error("❌ Auth useEffect: Error parsing cached user:", error);
        localStorage.removeItem("jobhub_user");
      }
    } else {
      console.log("❌ Auth useEffect: No cached user found");
      setIsAuthenticated(false);
    }
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("jobhub_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("jobhub_user");
    }
  }, [user]);

  const fetchUserProfile = useCallback(async (id: string) => {
    console.log("🔍 fetchUserProfile: Fetching profile for user ID:", id);
    
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", id).single();

    console.log("🔍 fetchUserProfile: Supabase response - data:", data);
    console.log("🔍 fetchUserProfile: Supabase response - error:", error);

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows found
      console.log("❌ fetchUserProfile: Error fetching profile (not PGRST116):", error);
      return null;
    }

    if (data) {
      const profile = {
        id: data.id,
        name: data.full_name || data.email.split("@")[0],
        email: data.email,
        avatar: data.avatar_url,
        role: data.role,
        joinedDate: data.joined_date,
        gender: data.gender, // Include gender
        jobPreferences: data.job_preferences || defaultJobPreferences,
        resumeUrl: data.resume_url || null, // New
        atsScores: data.resume_scores || [], // Map resume_scores to atsScores
        streaks: data.streaks || {}, // New
      };
      
      console.log("✅ fetchUserProfile: Successfully fetched profile:", profile);
      return profile;
    }
    
    console.log("❌ fetchUserProfile: No data found for user ID:", id);
    return null;
  }, [])

  const createOrUpdateUserProfile = useCallback(
    async (supabaseUser: SupabaseUser, preferences: JobPreferences, name?: string, gender?: string, extraFields?: Record<string, unknown>) => {
      const profilePayload: Record<string, unknown> = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        role: supabaseUser.user_metadata?.role || "User",
        joined_date: new Date().toISOString().split("T")[0],
        job_preferences: preferences,
        ...(extraFields || {}), // Allow setting resumeUrl, atsScores, streaks
      }

      // Only include gender if we actually have a value **and** the column exists.
      if (gender) {
        profilePayload.gender = gender
      }

      const { data, error } = await supabase.from("user_profiles").upsert(profilePayload, { onConflict: "id" }).select()

      if (error) {
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
        let finalProfile = null;
        try {
          const profile = await fetchUserProfile(session.user.id)
          finalProfile = profile;
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
              })
              setJobPreferences(newProfile.job_preferences)
              finalProfile = newProfile;
            }
          }
        } catch (err) {
          // No logging
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
          // Continue, but log the error. User might need to reset password later.
        }
      }

      // Profile creation/update is handled by onAuthStateChange listener
      // Increment total_users stat in portal_stats
      const { data: stats, error: statsError } = await supabase
        .from('portal_stats')
        .select('total_users')
        .eq('id', 1)
        .single();
      if (!statsError && stats) {
        await supabase
          .from('portal_stats')
          .update({ total_users: (stats.total_users || 0) + 1, last_updated: new Date().toISOString() })
          .eq('id', 1);
      }

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
      setLoading(false)
      return { success: false, message: error.message || "OTP verification failed." }
    }

    if (supabaseUser && session && newPassword) {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
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
      throw error // Re-throw to be caught by the component
    }
    // No need to set loading to false here, as Supabase will redirect the user
  }

  const logout = async () => {
    console.log("🚪 logout: Starting logout process");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ logout: Error during sign out:", error);
      } else {
        console.log("✅ logout: Successfully signed out from Supabase");
      }
      
      // Clear localStorage immediately
      localStorage.removeItem("jobhub_user");
      console.log("🧹 logout: Cleared localStorage");
      
      // Reset all state
      setUser(null);
      setIsAuthenticated(false);
      setJobPreferences(defaultJobPreferences);
      setSupabaseUser(null);
      console.log("🔄 logout: Reset all state");
      
    } catch (error) {
      console.error("❌ logout: Unexpected error:", error);
    } finally {
      setLoading(false);
      console.log("✅ logout: Set loading to false");
      
      // Refresh the page to ensure clean state
      console.log("🔄 logout: Refreshing page");
      window.location.reload();
    }
  }

  const updateProfile = async (updates: Partial<User> & { resumeUrl?: string; atsScores?: any[]; streaks?: any }) => {
    console.log("🔧 updateProfile: Starting profile update");
    console.log("🔧 updateProfile: Received updates:", updates);
    console.log("🔧 updateProfile: Current user:", user);
    console.log("🔧 updateProfile: Current supabaseUser:", supabaseUser);

    if (!user || !supabaseUser) {
      console.log("❌ updateProfile: No user or supabaseUser found, returning early");
      return;
    }

    setLoading(true);
    console.log("🔧 updateProfile: Set loading to true");

    const updatePayload: Record<string, unknown> = {
      full_name: updates.name,
      avatar_url: updates.avatar,
      role: updates.role,
    };

    console.log("🔧 updateProfile: Initial updatePayload:", updatePayload);

    if (updates.gender) {
      updatePayload.gender = updates.gender;
      console.log("🔧 updateProfile: Added gender to payload:", updates.gender);
    }
    if (updates.resumeUrl !== undefined) {
      updatePayload.resume_url = updates.resumeUrl;
      console.log("🔧 updateProfile: Added resumeUrl to payload:", updates.resumeUrl);
    }
    if (updates.atsScores !== undefined) {
      updatePayload.ats_scores = updates.atsScores;
      console.log("🔧 updateProfile: Added atsScores to payload:", updates.atsScores);
    }
    if (updates.streaks !== undefined) {
      updatePayload.streaks = updates.streaks;
      console.log("🔧 updateProfile: Added streaks to payload:", updates.streaks);
    }
    if (updates.target_field !== undefined) {
      updatePayload.target_field = updates.target_field;
      console.log("🔧 updateProfile: Added target_field to payload:", updates.target_field);
    }
    if (updates.target_companies !== undefined) {
      updatePayload.target_companies = updates.target_companies;
      console.log("🔧 updateProfile: Added target_companies to payload:", updates.target_companies);
    }
    if (updates.target_positions !== undefined) {
      updatePayload.target_positions = updates.target_positions;
      console.log("🔧 updateProfile: Added target_positions to payload:", updates.target_positions);
    }
    if (updates.experience_level !== undefined) {
      updatePayload.experience_level = updates.experience_level;
      console.log("🔧 updateProfile: Added experience_level to payload:", updates.experience_level);
    }

    console.log("🔧 updateProfile: Final updatePayload:", updatePayload);
    console.log("🔧 updateProfile: User ID for update:", user.id);

    const { data, error } = await supabase.from("user_profiles").update(updatePayload).eq("id", user.id).select();

    console.log("🔧 updateProfile: Supabase response - data:", data);
    console.log("🔧 updateProfile: Supabase response - error:", error);

    setLoading(false);
    console.log("🔧 updateProfile: Set loading to false");

    if (!error && data && data[0]) {
      console.log("✅ updateProfile: Update successful, updating local state");
      console.log("✅ updateProfile: Updated data from database:", data[0]);
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
      console.log("✅ updateProfile: Local state updated");
    } else {
      console.error("❌ updateProfile: Update failed or no data returned");
      console.error("❌ updateProfile: Error details:", error);
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
      // No logging
    } else if (data && data[0]) {
      setJobPreferences(preferences)
      setUser((prev) => (prev ? { ...prev, jobPreferences: preferences } : null))
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user || !supabaseUser) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', user.id)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload avatar')
      }

      const data = await response.json()
      
      // Update local user state with new avatar URL
      setUser((prev) => (prev ? { ...prev, avatar: data.avatarUrl } : null))
      
      // Refresh user profile to get updated data
      const profile = await fetchUserProfile(user.id)
      if (profile) {
        setUser(profile)
      }
    } catch (error) {
      // No logging
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeAvatar = async () => {
    if (!user || !supabaseUser) return

    setLoading(true)
    try {
      const response = await fetch(`/api/upload/avatar?userId=${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove avatar')
      }

      // Update local user state to remove avatar
      setUser((prev) => (prev ? { ...prev, avatar: null } : null))
      
      // Refresh user profile to get updated data
      const profile = await fetchUserProfile(user.id)
      if (profile) {
        setUser(profile)
      }
    } catch (error) {
      // No logging
      throw error
    } finally {
      setLoading(false)
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
        uploadAvatar,
        removeAvatar,
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
