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
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "Job Board",
      href: "/",
      icon: Briefcase,
      active: pathname === "/",
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
