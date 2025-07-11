"use client"

import { JobScraperDashboard } from "@/components/job-scraper-dashboard"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/login-modal"
import { useState } from "react"
import { Database, Lock } from "lucide-react"

export default function ScraperPage() {
  const { isAuthenticated } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <Database className="w-12 h-12 text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Job Scraper Dashboard
              </h1>
              <p className="text-gray-600 text-lg">Sign in to access the job scraping tools</p>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Admin Access Required</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Scrape jobs from company career pages</li>
                  <li>• Automatically update job database</li>
                  <li>• Monitor scraping performance</li>
                  <li>• Export scraped data</li>
                  <li>• Schedule automated scraping</li>
                </ul>
              </CardContent>
            </Card>

            <Button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
              size="lg"
            >
              Sign In to Continue
            </Button>

            <div className="text-sm text-gray-500">Demo account: sagar@gmail.com / sagarkori</div>
          </div>
        </div>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-8">
      <JobScraperDashboard />
    </div>
  )
}
