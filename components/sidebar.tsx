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
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  Mail,
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
  // Removed Job Scraper: { name: "Job Scraper", href: "/scraper", icon: Database, color: "text-indigo-600 bg-indigo-100" },
  { name: "Live Emails", href: "/live-emails", icon: Mail, color: "text-pink-600 bg-pink-100" },
  { name: "Resume ATS Scoring", href: "/resume-scoring", icon: FileText, color: "text-orange-600 bg-orange-100" },
]

type SidebarProps = {}

export function Sidebar({}: SidebarProps) {
  const pathname = usePathname()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const [isCollapsed, setIsCollapsed] = useState(false) // Keeping for potential future use

  return (
    <>
      <div
        className={`flex h-full max-h-screen flex-col gap-2 border-r bg-gradient-to-b from-slate-50 to-white shadow-lg w-64 dark:from-gray-800 dark:to-gray-900`}
      >
        <div className="flex h-[60px] items-center border-b px-4 bg-gradient-to-r from-blue-500 to-purple-600">
          <Link className="flex items-center gap-2 font-semibold text-white" href="/">
            <Briefcase className="h-6 w-6" />
            <span className="text-lg">JobHub</span>
          </Link>
        </div>

        <ScrollArea className="flex-1">
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
        </ScrollArea>

        {/* User Section */}
        <div className="mt-auto p-4 border-t bg-gradient-to-r from-gray-50 to-gray-100">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`w-full justify-start h-12 hover:bg-white/50`}>
                  <div className={`flex items-center gap-3`}>
                    <Avatar className="ring-2 ring-blue-200">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
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
              className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white`}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <JobPreferencesModal isOpen={isJobPreferencesModalOpen} onClose={() => setIsJobPreferencesModalOpen(false)} />
    </>
  )
}
