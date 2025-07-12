"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Bell, Mail, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

interface NotificationRecord {
  id: string
  job_id: string
  notification_type: string
  sent_at: string
  status: string
  error_message?: string
}

export function NotificationHistory() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

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
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 