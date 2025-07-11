"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  HelpCircle,
  Bell,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { ProfileModal } from "@/components/profile-modal"
import { JobPreferencesModal } from "@/components/job-preferences-modal"

const navigationItems = [
  { name: "Search Jobs", href: "/", icon: Search, color: "text-blue-600 bg-blue-100" },
  { name: "Main Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-green-600 bg-green-100" },
  { name: "Personal Dashboard", href: "/personal", icon: User, color: "text-purple-600 bg-purple-100" },
  { name: "Resume ATS Scoring", href: "/resume-scoring", icon: FileText, color: "text-orange-600 bg-orange-100" },
]

interface SidebarProps {
  selectedCategory?: string | null
  setSelectedCategory?: (category: string | null) => void
}

export function Sidebar({ selectedCategory, setSelectedCategory }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <div
        className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-gradient-to-b from-slate-50 to-white shadow-lg lg:block dark:from-gray-800 dark:to-gray-900`}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-4 bg-gradient-to-r from-blue-500 to-purple-600">
            <Link className="flex items-center gap-2 font-semibold text-white" href="/">
              <Briefcase className="h-6 w-6" />
              {!isCollapsed && <span className="text-lg">JobHub</span>}
            </Link>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 py-4 px-2">
              <div>
                {!isCollapsed && (
                  <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gray-700">Navigation</h2>
                )}
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} h-12 transition-all duration-200 hover:scale-105 ${
                        pathname === item.href ? `${item.color} shadow-md` : "hover:bg-gray-100 text-gray-600"
                      }`}
                      asChild
                    >
                      <Link href={item.href} title={isCollapsed ? item.name : undefined}>
                        <item.icon className="h-5 w-5" />
                        {!isCollapsed && <span className="ml-3">{item.name}</span>}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Toggle Button - Moved above user section */}
          <div className="px-4 pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full justify-center hover:bg-gray-100 text-gray-600"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* User Section */}
          <div className="mt-auto p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} h-12 hover:bg-white/50`}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                      <Avatar className="ring-2 ring-blue-200">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {!isCollapsed && (
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center space-x-2 p-2">
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsJobPreferencesModalOpen(true)}>
                    <Bell className="mr-2 h-4 w-4" />
                    Job Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
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
              <Button
                onClick={() => setIsLoginModalOpen(true)}
                className={`w-full ${isCollapsed ? "px-2" : ""} bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white`}
              >
                {isCollapsed ? <User className="h-4 w-4" /> : "Sign In"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <JobPreferencesModal isOpen={isJobPreferencesModalOpen} onClose={() => setIsJobPreferencesModalOpen(false)} />
    </>
  )
}
