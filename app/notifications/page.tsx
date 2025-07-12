"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JobPreferencesModal } from "@/components/job-preferences-modal"
import { NotificationHistory } from "@/components/notification-history"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Bell, Settings, Mail, MessageSquare, Smartphone, BarChart3 } from "lucide-react"

export default function NotificationsPage() {
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false)
  const { user, isAuthenticated, jobPreferences } = useAuth()
  const { toast } = useToast()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
            <Bell className="w-12 h-12 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Notification Center
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              Sign in to manage your job notifications and preferences
            </p>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  const getNotificationStatus = () => {
    const { notifications } = jobPreferences
    const enabledCount = Object.values(notifications).filter(Boolean).length
    return {
      enabled: enabledCount > 0,
      count: enabledCount,
      total: Object.keys(notifications).length
    }
  }

  const notificationStatus = getNotificationStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Notification Center
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your job alerts and notification preferences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Notification Status</CardTitle>
              <Bell className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {notificationStatus.enabled ? "Active" : "Inactive"}
              </div>
              <p className="text-xs text-blue-700">
                {notificationStatus.count}/{notificationStatus.total} channels enabled
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Email Alerts</CardTitle>
              <Mail className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {jobPreferences.notifications.email ? "Enabled" : "Disabled"}
              </div>
              <p className="text-xs text-green-700">
                Receive job alerts via email
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Preferences</CardTitle>
              <Settings className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {jobPreferences.keywords.length + jobPreferences.industries.length + jobPreferences.locations.length}
              </div>
              <p className="text-xs text-purple-700">
                Active filters configured
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="preferences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>Current Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Preferences Summary */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-3">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPreferences.keywords.length > 0 ? (
                        jobPreferences.keywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary">
                            {keyword}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No keywords set</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPreferences.industries.length > 0 ? (
                        jobPreferences.industries.map((industry) => (
                          <Badge key={industry} variant="secondary">
                            {industry}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">All industries</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Locations</h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPreferences.locations.length > 0 ? (
                        jobPreferences.locations.map((location) => (
                          <Badge key={location} variant="secondary">
                            {location}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">All locations</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Job Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {jobPreferences.jobTypes.length > 0 ? (
                        jobPreferences.jobTypes.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">All job types</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notification Channels */}
                <div>
                  <h3 className="font-semibold mb-3">Notification Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-gray-500">Receive job alerts via email</p>
                        </div>
                      </div>
                      <Badge variant={jobPreferences.notifications.email ? "default" : "secondary"}>
                        {jobPreferences.notifications.email ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-500">SMS Notifications</p>
                          <p className="text-sm text-gray-400">Receive job alerts via SMS</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-400">
                        Coming Soon
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-500">WhatsApp Notifications</p>
                          <p className="text-sm text-gray-400">Receive job alerts via WhatsApp</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-400">
                        Coming Soon
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsPreferencesModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <NotificationHistory />
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Notification Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Statistics coming soon</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Track your notification performance and engagement
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Notifications Button */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Test Notifications</h3>
              <p className="text-gray-600">
                Test your notification setup with sample job alerts
              </p>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/notifications/process', {
                      method: 'GET'
                    })
                    const data = await response.json()
                    
                    if (data.success) {
                      toast({
                        title: "Test Notifications Sent!",
                        description: `Processed ${data.jobsProcessed} mock job notifications. Check your email and notification history.`,
                      })
                    } else {
                      toast({
                        title: "Error",
                        description: "Failed to send test notifications",
                        variant: "destructive",
                      })
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to send test notifications",
                      variant: "destructive",
                    })
                  }
                }}
                variant="outline"
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Send Test Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Modal */}
      <JobPreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
      />
    </div>
  )
} 