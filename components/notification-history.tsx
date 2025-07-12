"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NotificationRecord {
  id: string
  job_id: string
  notification_type: string
  sent_at: string
  status: string
  error_message?: string
  notification_payload?: {
    emailContent?: string
    textContent?: string
    job?: {
      company: string
      title: string
      location: string
      postedDate: string
      industry: string
      type: string
      experienceLevel: string
      remote: boolean
      salary?: {
        min: number
        max: number
      }
      url?: string // Added url to the interface
    }
    [key: string]: any
  }
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);

  const fetchNotificationHistory = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notifications/history?userId=${user.id}&limit=50`)
      const data = await response.json()

      if (data.success) {
        setNotifications(data.notifications)
      } else {
        toast({
          title: "Error",
          description: "Failed to load notification history",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching notification history:", error)
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotificationHistory()
  }, [user])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Sent</Badge>
      case 'failed':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please sign in to view notification history</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <span>Notification History</span>
          </CardTitle>
          <Button
            onClick={fetchNotificationHistory}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading notification history...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Notifications will appear here when new jobs match your preferences
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(notification.status)}
                    <div>
                      <p className="font-medium text-sm">
                        Job Alert - {notification.job_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(notification.sent_at)}
                      </p>
                      {notification.error_message && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {notification.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(notification.status)}
                    <Badge variant="outline" className="text-xs">
                      {notification.notification_type}
                    </Badge>
                  </div>
                </div>
                {/* Improved job info display */}
                {notification.notification_payload?.job ? (
                  <div className="bg-gray-50 rounded p-3 mt-2 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.notification_payload.job.url ? (
                        <a
                          href={notification.notification_payload.job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-base text-blue-700 hover:underline flex items-center gap-1"
                        >
                          {notification.notification_payload.job.title}
                          <span className="text-gray-400">@</span>
                          <span className="font-medium text-base text-gray-800">{notification.notification_payload.job.company}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" /></svg>
                        </a>
                      ) : (
                        <span className="font-semibold text-base text-blue-700">{notification.notification_payload.job.title}</span>
                      )}
                      <span className="text-gray-500">@</span>
                      <span className="font-medium text-base text-gray-800">{notification.notification_payload.job.company}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-700 mb-1">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Location:</span>
                        <span>{notification.notification_payload.job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Posted:</span>
                        <span>{notification.notification_payload.job.postedDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Industry:</span>
                        <span>{notification.notification_payload.job.industry}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Type:</span>
                        <span>{notification.notification_payload.job.type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Experience:</span>
                        <span>{notification.notification_payload.job.experienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Remote:</span>
                        <span>{notification.notification_payload.job.remote ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">Salary:</span>
                        <span>${notification.notification_payload.job.salary?.min?.toLocaleString?.() ?? ''} - ${notification.notification_payload.job.salary?.max?.toLocaleString?.() ?? ''}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded p-2 text-xs text-gray-500 mt-2">No job info stored</div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 