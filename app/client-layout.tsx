"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react" // Import useState for sidebar collapse

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-all duration-200 ${isSidebarCollapsed ? "lg:ml-[60px]" : "lg:ml-[240px]"}`}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </AuthProvider>
  )
}
