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
  updateProfile: (updates: Partial<User> & { resumeUrl?: string; atsScores?: any[]; streaks?: any }) => Promise<void>
  updateJobPreferences: (preferences: JobPreferences) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  removeAvatar: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  loading: boolean
  supabaseUser: SupabaseUser | null
  isInitialized: boolean
  addTrackedJob: (job: any) => Promise<void>
  updateTrackedJob: (jobId: string, updates: any) => Promise<void>
  removeTrackedJob: (jobId: string) => Promise<void>
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
  const [isInitialized, setIsInitialized] = useState(false)

  const fetchUserProfile = useCallback(async (id: string) => {
    const { data, error } = await supabase.from("user_profiles").select("*").eq("id", id).single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (data) {
      const profile = {
        id: data.id,
        name: data.full_name || data.email.split("@")[0],
        email: data.email,
        avatar: data.avatar_url,
        role: data.role || "user", // Default to "user" role if not set
        occupation: data.occupation, // Separate occupation field
        joinedDate: data.joined_date,
        gender: data.gender,
        jobPreferences: data.job_preferences || defaultJobPreferences,
        resumeUrl: data.resume_url || null,
        atsScores: data.resume_scores || [],
        streaks: data.streaks || {},
        // Map job preference fields from database
        target_field: data.target_field,
        target_companies: data.target_companies,
        target_positions: data.target_positions,
        experience_level: data.experience_level,
        // Map streak fields from DB columns to camelCase
        loginDates: data.login_dates || [],
        totalApplications: data.total_applications || 0,
        lastLoginDate: data.last_login_date || null,
        lastApplicationDate: data.last_application_date || null,
        jobsTracking: data.jobs_tracking || [],
      };
      
      return profile;
    }
    
    return null;
  }, [])

  // Helper methods for jobsTracking
  const addTrackedJob = async (job: any) => {
    if (!user || !supabaseUser) return;
    const updatedJobs = [...(user.jobsTracking || []), job];
    await supabase.from("user_profiles").update({ jobs_tracking: updatedJobs }).eq("id", user.id);
    setUser((prev) => prev ? { ...prev, jobsTracking: updatedJobs } : null);
  };

  const updateTrackedJob = async (jobId: string, updates: any) => {
    if (!user || !supabaseUser) return;
    const updatedJobs = (user.jobsTracking || []).map((job) => job.id === jobId ? { ...job, ...updates } : job);
    await supabase.from("user_profiles").update({ jobs_tracking: updatedJobs }).eq("id", user.id);
    setUser((prev) => prev ? { ...prev, jobsTracking: updatedJobs } : null);
  };

  const removeTrackedJob = async (jobId: string) => {
    if (!user || !supabaseUser) return;
    const updatedJobs = (user.jobsTracking || []).filter((job) => job.id !== jobId);
    await supabase.from("user_profiles").update({ jobs_tracking: updatedJobs }).eq("id", user.id);
    setUser((prev) => prev ? { ...prev, jobsTracking: updatedJobs } : null);
  };

  const createOrUpdateUserProfile = useCallback(
    async (supabaseUser: SupabaseUser, preferences: JobPreferences, name?: string, gender?: string, extraFields?: Record<string, unknown>) => {
      const profilePayload: Record<string, unknown> = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        full_name: name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0],
        avatar_url: supabaseUser.user_metadata?.avatar_url,
        role: supabaseUser.user_metadata?.role || "user", // Default to "user" role for new accounts
        joined_date: new Date().toISOString().split("T")[0],
        job_preferences: preferences,
        ...(extraFields || {}),
      }

      if (gender) {
        profilePayload.gender = gender
      } else if (supabaseUser.user_metadata?.gender) {
        profilePayload.gender = supabaseUser.user_metadata.gender
      }

      const { data, error } = await supabase.from("user_profiles").upsert(profilePayload, { onConflict: "id" }).select()

      if (error) {
        return null
      }
      return data ? data[0] : null
    },
    [],
  )

  // Refactored: Only check Supabase session on mount and tab visibility change
  const initializeAuth = useCallback(async () => {
    setLoading(true);
    let session;
    try {
      const { data } = await supabase.auth.getSession();
      session = data.session;
      if (session?.user) {
        setSupabaseUser(session.user);
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setJobPreferences(profile.jobPreferences);
            setIsAuthenticated(true);
          } else {
            const newProfile = await createOrUpdateUserProfile(session.user, defaultJobPreferences);
            if (newProfile) {
              const userProfile = {
                id: newProfile.id,
                name: newProfile.full_name || newProfile.email.split("@")[0],
                email: newProfile.email,
                avatar: newProfile.avatar_url,
                role: newProfile.role,
                occupation: newProfile.occupation,
                joinedDate: newProfile.joined_date,
                gender: newProfile.gender,
                jobPreferences: newProfile.job_preferences,
                target_field: newProfile.target_field,
                target_companies: newProfile.target_companies,
                target_positions: newProfile.target_positions,
                experience_level: newProfile.experience_level,
              };
              setUser(userProfile);
              setJobPreferences(newProfile.job_preferences);
              setIsAuthenticated(true);
            }
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
        }
      } else {
        if (user !== null) {
          setUser(null);
        }
        setIsAuthenticated(false);
        setJobPreferences(defaultJobPreferences);
        setSupabaseUser(null);
      }
    } catch (error) {
      console.error("Error in initializeAuth:", error);
      if (user !== null) {
        setUser(null);
      }
      setIsAuthenticated(false);
      setJobPreferences(defaultJobPreferences);
      setSupabaseUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [user, fetchUserProfile]);

  // Define refreshUserProfile before it's used in useEffect
  const refreshUserProfile = useCallback(async () => {
    if (!supabaseUser) {
      return;
    }

    // Check if session is still valid
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsAuthenticated(false);
      setUser(null);
      setSupabaseUser(null);
      return;
    }

    setLoading(true);
    try {
      const profile = await fetchUserProfile(supabaseUser.id);
      if (profile) {
        setUser(profile);
        setJobPreferences(profile.jobPreferences);
        setIsAuthenticated(true);
      } else {
        // If no profile found, user might have been deleted
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      // Handle error silently but log it
    } finally {
      setLoading(false);
    }
  }, [supabaseUser, fetchUserProfile]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Listen for auth state changes (sign in/sign out)
  useEffect(() => {
    if (!isInitialized) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setSupabaseUser(session.user);
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            setUser(profile);
            setJobPreferences(profile.jobPreferences);
            setIsAuthenticated(true);
          } else {
            const newProfile = await createOrUpdateUserProfile(session.user, defaultJobPreferences);
            if (newProfile) {
              const userProfile = {
                id: newProfile.id,
                name: newProfile.full_name || newProfile.email.split("@")[0],
                email: newProfile.email,
                avatar: newProfile.avatar_url,
                role: newProfile.role,
                occupation: newProfile.occupation,
                joinedDate: newProfile.joined_date,
                gender: newProfile.gender,
                jobPreferences: newProfile.job_preferences,
                target_field: newProfile.target_field,
                target_companies: newProfile.target_companies,
                target_positions: newProfile.target_positions,
                experience_level: newProfile.experience_level,
              };
              setUser(userProfile);
              setJobPreferences(newProfile.job_preferences);
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          // Don't set authentication to false on error, just log it
        }
      } else {
        // Clear all state when user signs out
        setUser(null);
        setIsAuthenticated(false);
        setJobPreferences(defaultJobPreferences);
        setSupabaseUser(null);
      }
      setLoading(false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isInitialized, fetchUserProfile, createOrUpdateUserProfile]);

  // Listen for tab visibility change (tab change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated && user) {
        // Only refresh the user profile if we're already authenticated
        // Don't reset the entire auth state
        console.log("[Auth Debug] Tab became visible, refreshing user profile");
        
        // Check if session is still valid before refreshing
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            refreshUserProfile();
          } else {
            console.log("[Auth Debug] Session expired, re-initializing auth");
            initializeAuth();
          }
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, user, refreshUserProfile, initializeAuth]);

  // Periodic session check to maintain authentication state
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const sessionCheckInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user && isAuthenticated) {
        console.log("[Auth Debug] Session check failed, re-initializing auth");
        initializeAuth();
      } else if (session?.user && isAuthenticated) {
        // Session is valid, but let's refresh the profile data periodically
        console.log("[Auth Debug] Periodic profile refresh");
        refreshUserProfile();
      }
    }, 60000); // Check every 60 seconds and refresh profile
    
    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated, user, initializeAuth, refreshUserProfile]);

  // Listen for user activity to refresh auth state after inactivity
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    let activityTimeout: NodeJS.Timeout;
    
    const handleUserActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        // User has been inactive for 5 minutes, refresh auth state
        console.log("[Auth Debug] User activity detected, refreshing auth state");
        refreshUserProfile();
      }, 300000); // 5 minutes
    };
    
    // Listen for user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });
    
    return () => {
      clearTimeout(activityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [isAuthenticated, user, refreshUserProfile]);

  // Remove all localStorage usage for user persistence

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInData?.user) {
      return { success: true, message: "You have successfully signed in." };
    }

    return {
      success: false,
      message: "Invalid email or password.",
      errorType: "invalid_credentials",
    };
  }

  const signup = async (
    name: string,
    email: string,
    password: string,
    gender: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);

    // Client no longer checks existing user; handled by server API before signup

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          full_name: name,
          gender: gender,
          password: password,
        },
        shouldCreateUser: true,
      },
    });

    if (error) {
      setLoading(false);
      if (
        error instanceof AuthApiError &&
        error.status === 400 &&
        error.message?.toLowerCase().includes("user already registered")
      ) {
        return { success: false, message: "An account with this email already exists. Please log in." };
      }
      return { success: false, message: error.message || "Failed to send OTP for signup." };
    }

    setLoading(false);
    return { success: true, message: "OTP sent to your email. Please verify to complete signup." };
  }

  const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    let verifyRes = await supabase.auth.verifyOtp({ email, token, type: "signup" });

    if (verifyRes.error) {
      // Retry with magiclink in case the user already existed
      verifyRes = await supabase.auth.verifyOtp({ email, token, type: "magiclink" });
    }

    const { data: { user: supabaseUser, session }, error } = verifyRes;

    if (error) {
      setLoading(false);
      return { success: false, message: error.message || "OTP verification failed." };
    }

    if (supabaseUser && session) {
      const { password, ...metadata } = supabaseUser.user_metadata || {};
      if (password) {
        const { error: updateError } = await supabase.auth.updateUser({ password: password });
        if (updateError) {
          // Continue, but log the error. User might need to reset password later.
        }
      }

      // Profile creation/update is handled by onAuthStateChange listener
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

      setLoading(false);
      return { success: true, message: "Account verified successfully!" };
    }

    setLoading(false);
    return { success: false, message: "OTP verification failed." };
  }

  const sendPasswordResetOtp = async (email: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      setLoading(false);
      if (
        error instanceof AuthApiError &&
        error.status === 400 &&
        error.message?.toLowerCase().includes("user not found")
      ) {
        return { success: false, message: "No account found with this email." };
      }
      return { success: false, message: error.message || "Failed to send password reset OTP." };
    }

    setLoading(false);
    return { success: true, message: "Password reset OTP sent to your email." };
  }

  const verifyPasswordResetOtp = async (
    email: string,
    token: string,
    newPassword?: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    const {
      data: { user: supabaseUser, session },
      error,
    } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });

    if (error) {
      setLoading(false);
      return { success: false, message: error.message || "OTP verification failed." };
    }

    if (supabaseUser && session && newPassword) {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setLoading(false);
        return { success: false, message: updateError.message || "Failed to set new password." };
      }
      setLoading(false);
      return { success: true, message: "Password reset successfully!" };
    }

    setLoading(false);
    return { success: false, message: "OTP verification failed or new password not provided." };
  }

  const loginWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/personal",
      },
    });

    if (error) {
      throw error;
    }
  }

  const logout = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });

      // Clear localStorage immediately
      // localStorage.removeItem("jobhub_user"); // Removed as per new logic
      
      // Reset all state
      setUser(null);
      setIsAuthenticated(false);
      setJobPreferences(defaultJobPreferences);
      setSupabaseUser(null);
      
    } catch (error) {
      // Handle unexpected error but continue with logout
    } finally {
      setLoading(false);
      
      // Refresh the page to ensure clean state
      window.location.reload();
    }
  }

  const updateProfile = async (updates: Partial<User> & { resumeUrl?: string; atsScores?: any[]; streaks?: any }) => {
    console.log("[Profile Update Debug] Starting profile update with:", updates);
    
    if (!user || !supabaseUser) {
      console.error("[Profile Update Debug] Missing user or supabaseUser:", { user: !!user, supabaseUser: !!supabaseUser });
      return;
    }

    console.log("[Profile Update Debug] Current user ID:", user.id);
    setLoading(true);

    const updatePayload: Record<string, unknown> = {
      full_name: updates.name,
      avatar_url: updates.avatar,
    };

    // Handle role updates (admin/user) - should be restricted
    if (updates.role !== undefined) {
      updatePayload.role = updates.role;
    }
    
    // Handle occupation updates (job title)
    if (updates.occupation !== undefined) {
      updatePayload.occupation = updates.occupation;
    }

    if (updates.gender) {
      updatePayload.gender = updates.gender;
    }
    if (updates.resumeUrl !== undefined) {
      updatePayload.resume_url = updates.resumeUrl;
    }
    if (updates.atsScores !== undefined) {
      updatePayload.ats_scores = updates.atsScores;
    }
    if (updates.streaks !== undefined) {
      updatePayload.streaks = updates.streaks;
    }
    if (updates.target_field !== undefined) {
      updatePayload.target_field = updates.target_field;
      console.log("[Profile Update Debug] Setting target_field:", updates.target_field);
    }
    if (updates.target_companies !== undefined) {
      updatePayload.target_companies = updates.target_companies;
      console.log("[Profile Update Debug] Setting target_companies:", updates.target_companies);
      console.log("[Profile Update Debug] target_companies type:", Array.isArray(updates.target_companies) ? 'Array' : typeof updates.target_companies);
      console.log("[Profile Update Debug] target_companies length:", updates.target_companies?.length);
    }
    if (updates.target_positions !== undefined) {
      updatePayload.target_positions = updates.target_positions;
      console.log("[Profile Update Debug] Setting target_positions:", updates.target_positions);
      console.log("[Profile Update Debug] target_positions type:", Array.isArray(updates.target_positions) ? 'Array' : typeof updates.target_positions);
      console.log("[Profile Update Debug] target_positions length:", updates.target_positions?.length);
    }
    if (updates.experience_level !== undefined) {
      updatePayload.experience_level = updates.experience_level;
      console.log("[Profile Update Debug] Setting experience_level:", updates.experience_level);
    }
    if (updates.currentStreak !== undefined) {
      updatePayload.current_streak = updates.currentStreak;
    }
    if (updates.longestStreak !== undefined) {
      updatePayload.longest_streak = updates.longestStreak;
    }
    if (updates.totalApplications !== undefined) {
      updatePayload.total_applications = updates.totalApplications;
    }
    if (updates.loginDates !== undefined) {
      updatePayload.login_dates = updates.loginDates;
    }
    if (updates.lastLoginDate !== undefined) {
      updatePayload.last_login_date = updates.lastLoginDate;
    }
    if (updates.lastApplicationDate !== undefined) {
      updatePayload.last_application_date = updates.lastApplicationDate;
    }

    console.log("[Profile Update Debug] Update payload being sent to database:", updatePayload);
    console.log("[Profile Update Debug] Payload JSON stringify:", JSON.stringify(updatePayload, null, 2));

    const { data, error } = await supabase.from("user_profiles").update(updatePayload).eq("id", user.id).select();

    console.log("[Profile Update Debug] Database response:", { data, error });
    if (data && data.length > 0) {
      console.log("[Profile Update Debug] Updated database record:", data[0]);
      console.log("[Profile Update Debug] Database target_companies:", data[0].target_companies);
      console.log("[Profile Update Debug] Database target_positions:", data[0].target_positions);
      console.log("[Profile Update Debug] Database experience_level:", data[0].experience_level);
    }
    setLoading(false);

    if (error) {
      console.error("[Profile Update Debug] Database update failed:", error);
      return;
    }

    if (!data || data.length === 0) {
      console.error("[Profile Update Debug] No data returned from database update");
      return;
    }

    console.log("[Profile Update Debug] Database update successful, refreshing user profile from database");
    
    // Instead of manually updating state, refresh the profile from database to ensure consistency
    await refreshUserProfile();
    console.log("[Profile Update Debug] Profile refresh completed");
  }

  const updateJobPreferences = async (preferences: JobPreferences) => {
    if (!user || !supabaseUser) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ job_preferences: preferences })
      .eq("id", user.id)
      .select();

    setLoading(false);
    if (error) {
      // Handle error silently
    } else if (data && data[0]) {
      setJobPreferences(preferences);
      setUser((prev) => (prev ? { ...prev, jobPreferences: preferences } : null));
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!user || !supabaseUser) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      const data = await response.json();
      
      // Update local user state with new avatar URL
      setUser((prev) => (prev ? { ...prev, avatar: data.avatarUrl } : null));
      
      // Refresh user profile to get updated data
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const removeAvatar = async () => {
    if (!user || !supabaseUser) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/upload/avatar?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove avatar');
      }

      // Update local user state to remove avatar
      setUser((prev) => (prev ? { ...prev, avatar: null } : null));
      
      // Refresh user profile to get updated data
      const profile = await fetchUserProfile(user.id);
      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
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
        refreshUserProfile,
        loading,
        supabaseUser,
        isInitialized,
        addTrackedJob,
        updateTrackedJob,
        removeTrackedJob,
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
  return context as AuthContextType
}
