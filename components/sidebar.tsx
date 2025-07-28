"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { ProfileModal } from "@/components/profile-modal"
import { JobPreferencesModal } from "@/components/job-preferences-modal"
import { ReviewModal } from "@/components/review-modal"
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const { user, isAuthenticated, logout, loading, isInitialized } = useAuth()
  const profileVisible = isAuthenticated && !!user

  // Initialize collapsed state to prevent hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load collapsed state from localStorage after hydration
  useEffect(() => {
    if (isClient) {
      const savedState = localStorage.getItem('sidebar-collapsed')
      if (savedState === 'true') {
        setIsCollapsed(true)
      }
    }
  }, [isClient])

  // Save collapsed state to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString())
    }
  }, [isCollapsed, isClient])

  const handleLogout = () => {
    logout()
  }

  const handleReviewSuccess = () => {
    setReviewSubmitted(true)
    setTimeout(() => setReviewSubmitted(false), 10000)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleHeaderClick = (e: React.MouseEvent) => {
    // Only toggle if clicking on the header background, not on buttons or links
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return
    }
    toggleCollapse()
  }

  return (
    <>
      <div
        className={`flex h-screen flex-col border-r bg-gradient-to-b from-slate-50 to-white shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        } dark:from-gray-800 dark:to-gray-900`}
      >
        {/* Header - Fixed */}
        <div 
          className="flex h-[60px] items-center border-b px-4 bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0"
        >
          <Link className="flex items-center gap-2 font-semibold text-white" href="/">
            <Briefcase className="h-6 w-6 flex-shrink-0" />
            {!isCollapsed && <span className="text-lg">JobHub</span>}
          </Link>
        </div>

        {/* Navigation - Controlled scrolling with no visible scrollbars during transition */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="space-y-4 py-4 px-2 min-h-full">
              <div className="space-y-4">
                <div>
                  {!isCollapsed && (
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gray-700 transition-opacity duration-300">Navigation</h2>
                  )}
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.name}
                        variant="ghost"
                        className={`w-full justify-start h-12 transition-all duration-200 hover:scale-105 ${
                          pathname === item.href ? `${item.color} shadow-md` : "hover:bg-gray-100 text-gray-600"
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                        asChild
                      >
                        <Link href={item.href} title={isCollapsed ? item.name : undefined}>
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span className="ml-3 transition-opacity duration-300">{item.name}</span>}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Review Badge Section */}
                <div className={`px-2 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
                  <div
                    onClick={() => setIsReviewModalOpen(true)}
                    className={`group cursor-pointer bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                      isCollapsed ? 'w-12 h-12 max-h-12 flex items-center justify-center p-2' : 'w-full max-h-20 p-3'
                    } ${reviewSubmitted ? 'from-green-400 to-green-600' : ''}`}
                    title={isCollapsed ? 'Leave a Review' : undefined}
                  >
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} min-h-0`}>
                      <Star className={`text-white flex-shrink-0 ${reviewSubmitted ? 'fill-current' : ''} h-5 w-5`} />
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0 transition-opacity duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold text-sm truncate">
                              {reviewSubmitted ? 'Review Submitted!' : 'Leave a Review'}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className="bg-white/20 text-white border-none text-xs hover:bg-white/30 transition-colors flex-shrink-0"
                            >
                              {reviewSubmitted ? '✓' : 'NEW'}
                            </Badge>
                          </div>
                          <p className="text-white/80 text-xs mt-1 truncate">
                            {reviewSubmitted ? 'Thank you for your feedback!' : 'Help us improve JobHub'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapse/Expand Button above profile section */}
        <div className="flex justify-center py-2 border-t border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-gray-500 hover:bg-gray-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* User Section - Fixed at bottom */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          {profileVisible ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`w-full justify-start h-12 hover:bg-white/50 ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}>
                  <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <UserAvatar user={user} size="md" className="ring-2 ring-blue-200 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.role && user.role !== "User" ? user.role : "Please select role"}
                        </p>
                      </div>
                    )}
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
          ) : loading ? (
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <p>Loading Profile...</p>
              
            </div>
          ) : (
            <Button
              onClick={() => setIsLoginModalOpen(true)}
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              {!isCollapsed ? 'Sign In' : <User className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <JobPreferencesModal isOpen={isJobPreferencesModalOpen} onClose={() => setIsJobPreferencesModalOpen(false)} />
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSuccess={handleReviewSuccess} 
      />
    </>
  )
}