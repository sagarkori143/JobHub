"use client"

import { useEffect, useState, useMemo } from "react"
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

  // Memoize the access check logic to prevent unnecessary recalculations
  const accessCheckResult = useMemo(() => {
    if (!isInitialized || loading || !isAuthenticated || !user) {
      return { shouldRedirect: !isAuthenticated && isInitialized && !loading, hasAccess: false }
    }

    let userHasAccess = false
    if (allowedRoles) {
      userHasAccess = allowedRoles.includes(user.role as UserRole)
    } else {
      userHasAccess = user.role === requiredRole
    }

    return { shouldRedirect: !userHasAccess, hasAccess: userHasAccess }
  }, [isInitialized, loading, isAuthenticated, user?.role, requiredRole, allowedRoles])

  useEffect(() => {
    // Only run when auth is initialized and not loading
    if (!isInitialized || loading) {
      setIsChecking(true)
      return
    }

    if (accessCheckResult.shouldRedirect) {
      setHasAccess(false)
      setIsChecking(false)
      router.push(redirectTo)
      return
    }

    setHasAccess(accessCheckResult.hasAccess)
    setIsChecking(false)
  }, [accessCheckResult, redirectTo, router, isInitialized, loading])

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
