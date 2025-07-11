"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <AuthProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div
          className={`flex-1 flex flex-col transition-all duration-200 ${
            isCollapsed ? "md:ml-[60px]" : "md:ml-[240px]"
          }`}
        >
          {children}
        </div>
      </div>
    </AuthProvider>
  )
}
