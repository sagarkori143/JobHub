"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  LayoutDashboard,
  Mail,
  FileText,
  Users,
  BarChart,
  Settings,
  Menu,
  X,
  CheckCircle,
  Hourglass,
  Award,
  XCircle,
  Search,
  User,
  LogOut,
  HelpCircle,
  Bell,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Added Avatar components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Added DropdownMenu components
import { useAuth } from "@/contexts/auth-context" // Added useAuth
import { LoginModal } from "@/components/login-modal" // Added LoginModal
import { ProfileModal } from "@/components/profile-modal" // Added ProfileModal
import { JobPreferencesModal } from "@/components/job-preferences-modal" // Added JobPreferencesModal
import { useState } from "react" // Added useState

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isJobPreferencesModalOpen, setIsJobPreferencesModalOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    {
      title: "Search Jobs",
      href: "/",
      icon: Search,
      active: pathname === "/",
    },
    {
      title: "Main Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "Applied",
      href: "/applied",
      icon: CheckCircle,
      active: pathname === "/applied",
    },
    {
      title: "Interviewing",
      href: "/interviewing",
      icon: Hourglass,
      active: pathname === "/interviewing",
    },
    {
      title: "Offers",
      href: "/offers",
      icon: Award,
      active: pathname === "/offers",
    },
    {
      title: "Rejected",
      href: "/rejected",
      icon: XCircle,
      active: pathname === "/rejected",
    },
    {
      title: "Personal Dashboard",
      href: "/personal",
      icon: Users,
      active: pathname === "/personal",
    },
    {
      title: "Resume Scoring",
      href: "/resume-scoring",
      icon: FileText,
      active: pathname === "/resume-scoring",
    },
    {
      title: "Live Emails",
      href: "/live-emails",
      icon: Mail,
      active: pathname === "/live-emails",
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart,
      active: pathname === "/analytics",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      active: pathname === "/settings",
    },
  ]

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col h-full border-r bg-background transition-all duration-200",
          isCollapsed ? "w-[60px]" : "w-[240px]",
          className,
        )}
      >
        <div className="flex items-center h-16 px-4 border-b">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-6 w-6" />
            <span className={cn("transition-opacity duration-200", isCollapsed && "opacity-0")}>Job Portal</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  item.active && "bg-muted text-primary",
                  isCollapsed && "justify-center",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className={cn("transition-opacity duration-200", isCollapsed && "opacity-0")}>{item.title}</span>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        {/* User Section for Desktop */}
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
        <div className="flex items-center justify-end h-16 px-4 border-t">
          <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex">
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
          <div className="flex flex-col h-full bg-background">
            <div className="flex items-center h-16 px-4 border-b">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-6 w-6" />
                <span>Job Portal</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 py-4">
              <nav className="grid items-start px-2 text-sm font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      item.active && "bg-muted text-primary",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </nav>
            </ScrollArea>
            {/* User Section for Mobile */}
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
        </SheetContent>
      </Sheet>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <JobPreferencesModal isOpen={isJobPreferencesModalOpen} onClose={() => setIsJobPreferencesModalOpen(false)} />
    </>
  )
}
