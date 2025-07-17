"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Mail,
  Bug,
  BarChart,
  Info,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { ProfileModal } from "@/components/profile-modal"
import { JobPreferencesModal } from "@/components/job-preferences-modal"
import { Skeleton } from "@/components/ui/skeleton"

const navigationItems = [
  { name: "Search Jobs", href: "/", icon: Search, color: "text-blue-600 bg-blue-100" },
  { name: "Main Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-green-600 bg-green-100" },
  { name: "Applications Tracking", href: "/personal", icon: User, color: "text-purple-600 bg-purple-100" },
  { name: "Job Notifications", href: "/notifications", icon: Bell, color: "text-orange-600 bg-orange-100" },
  { name: "Resume ATS Scoring", href: "/resume-scoring", icon: FileText, color: "text-indigo-600 bg-indigo-100" },
  {
    name: "Portal Stats",
    href: "/portal-stats",
    icon: BarChart,
    color: "text-blue-600 bg-blue-100"
  },
  {
    name: "About",
    href: "/about",
    icon: Info,
    color: "text-gray-600 bg-gray-100",
  },
]

type SidebarProps = {}

export function Sidebar({}: SidebarProps) {
  const pathname = usePathname()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] = useState(false)
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [showProfileSection, setShowProfileSection] = useState(false)

  // Determine when to show the profile section
  useEffect(() => {
    // Show profile section if:
    // 1. User is authenticated and user data exists, OR
    // 2. Loading is false and we have a cached user in localStorage
    if (isAuthenticated && user) {
      setShowProfileSection(true)
    } else if (!loading) {
      // Check localStorage as fallback
      const cachedUser = localStorage.getItem("jobhub_user")
      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser)
          setShowProfileSection(true)
        } catch {
          setShowProfileSection(false)
        }
      } else {
        setShowProfileSection(false)
      }
    }
  }, [isAuthenticated, user, loading])

  const handleLogout = () => {
    logout()
  }

  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      <div
        className={`flex h-screen flex-col border-r bg-gradient-to-b from-slate-50 to-white shadow-lg w-64 dark:from-gray-800 dark:to-gray-900`}
      >
        {/* Header - Fixed */}
        <div className="flex h-[60px] items-center border-b px-4 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0">
          <Link className="flex items-center gap-2 font-semibold text-white" href="/">
            <Briefcase className="h-6 w-6" />
            <span className="text-lg">JobHub</span>
          </Link>
        </div>

        {/* Navigation - Scrollable only if needed */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 py-4 px-2">
            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gray-700">Navigation</h2>
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={`w-full justify-start h-12 transition-all duration-200 hover:scale-105 ${
                      pathname === item.href ? `${item.color} shadow-md` : "hover:bg-gray-100 text-gray-600"
                    }`}
                    asChild
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Section - Fixed at bottom */}
        <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          {loading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          ) : showProfileSection && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`w-full justify-start h-12 hover:bg-white/50`}>
                  <div className={`flex items-center gap-3`}>
                    <UserAvatar user={user} size="md" className="ring-2 ring-blue-200 flex-shrink-0" />
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.role && user.role !== "User" ? user.role : "Please select role"}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center space-x-2 p-2">
                  <UserAvatar user={user} size="sm" className="flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.role && user.role !== "User" ? user.role : "Please select role"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsJobPreferencesModalOpen(true)}>
                  <Bell className="mr-2 h-4 w-4" />
                  Job Preferences
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !loading && (
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white`}
              >
                Sign In
              </Button>
            )
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <JobPreferencesModal isOpen={isJobPreferencesModalOpen} onClose={() => setIsJobPreferencesModalOpen(false)} />
    </>
  )
}