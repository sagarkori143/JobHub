"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  LayoutDashboard,
  User,
  Mail,
  Settings,
  BarChart,
  FileText,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = React.useState(false) // State for desktop collapse

  const navItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      active: pathname === "/",
    },
    {
      href: "/personal",
      icon: User,
      label: "Personal Dashboard",
      active: pathname === "/personal",
    },
    {
      href: "/live-emails",
      icon: Mail,
      label: "Live Emails",
      active: pathname === "/live-emails",
    },
    {
      href: "/resume-scoring",
      icon: FileText,
      label: "Resume Scoring",
      active: pathname === "/resume-scoring",
    },
    {
      href: "/dashboard",
      icon: BarChart,
      label: "Analytics Dashboard",
      active: pathname === "/dashboard",
    },
  ]

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r bg-gradient-to-b from-blue-500 to-purple-600 text-white transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 shrink-0">
        <Link href="/" className={cn("flex items-center gap-2 font-semibold", isCollapsed && "justify-center w-full")}>
          <Briefcase className="h-6 w-6" />
          {!isCollapsed && <span className="text-lg">JobHub</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex h-7 w-7 text-white hover:bg-white/20"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 flex flex-col gap-2 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <TooltipProvider key={item.href} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-white/20",
                    item.active ? "bg-white/30 text-white" : "text-white/80",
                    isCollapsed && "justify-center",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && item.label}
                  {isCollapsed && <span className="sr-only">{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>

      <div className="mt-auto p-2">
        <Separator className="my-2 bg-white/30" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white",
                isCollapsed && "justify-center",
              )}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} alt="User Avatar" />
                <AvatarFallback>{user?.name ? user.name.charAt(0) : "U"}</AvatarFallback>
              </Avatar>
              {!isCollapsed && <span className="flex-1 text-left truncate">{user?.name || "Guest User"}</span>}
              {isCollapsed && <span className="sr-only">User Profile</span>}
              {!isCollapsed && <ChevronRight className="ml-auto h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
