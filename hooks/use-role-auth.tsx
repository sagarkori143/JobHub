"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { UserRole } from "@/types/job-search"

interface UseRoleAuthOptions {
  requiredRole: UserRole
  redirectTo?: string
  allowedRoles?: UserRole[]
}

export function useRoleAuth(options: UseRoleAuthOptions) {
  const { user, isAuthenticated, loading, isInitialized } = useAuth()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  const { requiredRole, redirectTo = "/", allowedRoles } = options

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized || loading) {
      return
    }

    console.log("[Role Auth Debug] Checking access:", {
      isAuthenticated,
      userRole: user?.role,
      requiredRole,
      allowedRoles
    })

    // If not authenticated, redirect
    if (!isAuthenticated || !user) {
      console.log("[Role Auth Debug] User not authenticated, redirecting to:", redirectTo)
      setHasAccess(false)
      setIsChecking(false)
      router.push(redirectTo)
      return
    }

    // Check role-based access
    let userHasAccess = false

    if (allowedRoles) {
      // Check if user role is in allowed roles array
      userHasAccess = allowedRoles.includes(user.role as UserRole)
    } else {
      // Check specific required role
      userHasAccess = user.role === requiredRole
    }

    console.log("[Role Auth Debug] Access check result:", userHasAccess)

    if (!userHasAccess) {
      console.log("[Role Auth Debug] Access denied, redirecting to:", redirectTo)
      setHasAccess(false)
      setIsChecking(false)
      router.push(redirectTo)
      return
    }

    setHasAccess(true)
    setIsChecking(false)
  }, [isAuthenticated, user, loading, isInitialized, requiredRole, allowedRoles, redirectTo, router])

  return {
    hasAccess,
    isChecking,
    userRole: user?.role as UserRole,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user"
  }
}

// Higher-order component for protecting admin routes
export function withRoleAuth<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  options: UseRoleAuthOptions
) {
  return function ProtectedComponent(props: T) {
    const { hasAccess, isChecking } = useRoleAuth(options)

    if (isChecking) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      )
    }

    if (!hasAccess) {
      return null // Component will be redirected by the hook
    }

    return <WrappedComponent {...props} />
  }
}
