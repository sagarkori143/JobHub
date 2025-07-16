"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface UseAuthGuardOptions {
  redirectTo?: string
  requireAuth?: boolean
  redirectIfAuthenticated?: boolean
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  
  const {
    redirectTo = "/",
    requireAuth = true,
    redirectIfAuthenticated = false
  } = options

  useEffect(() => {
    console.log("🛡️ useAuthGuard: Checking authentication state");
    console.log("🛡️ useAuthGuard: isAuthenticated:", isAuthenticated);
    console.log("🛡️ useAuthGuard: user:", user);
    console.log("🛡️ useAuthGuard: loading:", loading);
    console.log("🛡️ useAuthGuard: requireAuth:", requireAuth);
    console.log("🛡️ useAuthGuard: redirectIfAuthenticated:", redirectIfAuthenticated);

    // Don't redirect while loading
    if (loading) {
      console.log("🛡️ useAuthGuard: Still loading, waiting...");
      return
    }

    // Check localStorage for immediate auth state
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem("jobhub_user") : null
    const hasCachedUser = cachedUser !== null

    console.log("🛡️ useAuthGuard: Cached user exists:", hasCachedUser);

    if (requireAuth && !isAuthenticated && !hasCachedUser) {
      console.log("❌ useAuthGuard: User not authenticated, redirecting to:", redirectTo);
      router.push(redirectTo)
      return
    }

    if (redirectIfAuthenticated && (isAuthenticated || hasCachedUser)) {
      console.log("✅ useAuthGuard: User is authenticated, redirecting to:", redirectTo);
      router.push(redirectTo)
      return
    }

    console.log("✅ useAuthGuard: Authentication check passed");
  }, [isAuthenticated, user, loading, requireAuth, redirectIfAuthenticated, redirectTo, router])

  return {
    isAuthenticated,
    user,
    loading
  }
} 