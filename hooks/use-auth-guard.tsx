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

    // Don't redirect while loading
    if (loading) {
      return
    }

    // Check localStorage for immediate auth state
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem("jobhub_user") : null
    const hasCachedUser = cachedUser !== null

    

    if (requireAuth && !isAuthenticated && !hasCachedUser) {
      router.push(redirectTo)
      return
    }

    if (redirectIfAuthenticated && (isAuthenticated || hasCachedUser)) {
      router.push(redirectTo)
      return
    }

  }, [isAuthenticated, user, loading, requireAuth, redirectIfAuthenticated, redirectTo, router])

  return {
    isAuthenticated,
    user,
    loading
  }
} 