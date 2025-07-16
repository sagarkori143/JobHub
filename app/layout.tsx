import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet components
import { Button } from "@/components/ui/button"
import { Menu, Briefcase } from "lucide-react"
import Link from "next/link"
import TrackVisit from "@/components/track-visit";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JobHub - Your Career Platform",
  description: "Find jobs, manage applications, and optimize your resume with ATS scoring"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrackVisit />
        <AuthProvider>
          <div className="flex h-screen">
            {/* Desktop Sidebar - Fixed */}
            <div className="hidden lg:block lg:flex-shrink-0">
              <Sidebar />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              {/* Mobile Header */}
              <header className="flex h-16 items-center gap-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 px-4 lg:hidden flex-shrink-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/20">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="flex flex-col p-0 w-64">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
                <Link className="flex items-center gap-2 font-semibold text-white" href="/">
                  <Briefcase className="h-6 w-6" />
                  <span className="text-lg">JobHub</span>
                </Link>
              </header>

              {/* Main Content - Scrollable */}
              <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
            </div>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
