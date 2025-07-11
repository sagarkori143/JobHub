"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { emailService } from "@/services/email-service"
import type { EmailRecipient, EmailStatus } from "@/types/email"
import { RefreshCw, Mail, CheckCircle, XCircle, List, Send, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LiveEmailsPage() {
  const [queued, setQueued] = useState<EmailRecipient[]>([])
  const [sending, setSending] = useState<EmailRecipient[]>([])
  const [sent, setSent] = useState<EmailRecipient[]>([])
  const [failed, setFailed] = useState<EmailRecipient[]>([])
  const [isSendingActive, setIsSendingActive] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const updateStatus = () => {
      const status = emailService.getQueueStatus()
      setQueued(status.queued)
      setSending(status.sending)
      setSent(status.sent)
      setFailed(status.failed)
      setIsSendingActive(status.queued.length > 0 || status.sending.length > 0)
    }

    // Initial load
    updateStatus()

    // Poll for updates every 200ms
    const interval = setInterval(updateStatus, 200)

    return () => clearInterval(interval)
  }, [])

  const handleClearAll = () => {
    emailService.clearAllEmails()
    setQueued([])
    setSending([])
    setSent([])
    setFailed([])
    setIsSendingActive(false)
    toast({
      title: "Email Queues Cleared",
      description: "All simulated email sending data has been reset.",
    })
  }

  const getStatusColor = (status: EmailStatus) => {
    switch (status) {
      case "queued":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "sending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "sent":
        return "bg-green-100 text-green-800 border-green-300"
      case "failed":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: EmailStatus) => {
    switch (status) {
      case "queued":
        return <List className="w-4 h-4" />
      case "sending":
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case "sent":
        return <CheckCircle className="w-4 h-4" />
      case "failed":
        return <XCircle className="w-4 h-4" />
      default:
        return <Mail className="w-4 h-4" />
    }
  }

  const EmailItem = ({ email }: { email: EmailRecipient }) => (
    <div className="flex flex-col p-3 border rounded-lg bg-white shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-blue-500" />
          <p className="font-medium text-gray-800 text-sm">{email.email}</p>
        </div>
        <Badge className={getStatusColor(email.status)}>
          {getStatusIcon(email.status)}
          <span className="ml-1 capitalize text-xs">{email.status}</span>
        </Badge>
      </div>
      <p className="text-xs text-gray-600 truncate">
        {email.jobTitle} at {email.company}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(email.timestamp).toLocaleTimeString()} - {email.message || "Processing..."}
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-8">
      {" "}
      {/* Adjusted responsive padding */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live Email Alerts
            </h1>
            <p className="text-gray-600 text-base md:text-lg">
              Monitor the status of job alert emails being sent to subscribers.
            </p>
          </div>
          <Button
            onClick={handleClearAll}
            variant="outline"
            disabled={!isSendingActive && sent.length === 0 && failed.length === 0}
            className="mt-4 sm:mt-0 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Information Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Email alerts are triggered by backend processes.</p>
              <p className="text-sm text-blue-700">
                For a real demonstration, you would integrate the `emailService.sendNewJobAlerts()` call into your
                scraper or a dedicated serverless function.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {" "}
          {/* Made responsive */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-700">
                <List className="w-5 h-5" />
                <span>Queued ({queued.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {queued.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No emails in queue.</p>
              ) : (
                queued.map((email) => <EmailItem key={email.id} email={email} />)
              )}
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-700">
                <Send className="w-5 h-5" />
                <span>Sending ({sending.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {sending.length === 0 ? (
                <p className="text-sm text-yellow-600 text-center py-4">No emails currently sending.</p>
              ) : (
                sending.map((email) => <EmailItem key={email.id} email={email} />)
              )}
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span>Sent ({sent.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {sent.length === 0 ? (
                <p className="text-sm text-green-600 text-center py-4">No emails sent yet.</p>
              ) : (
                sent.map((email) => <EmailItem key={email.id} email={email} />)
              )}
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span>Failed ({failed.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {failed.length === 0 ? (
                <p className="text-sm text-red-600 text-center py-4">No failed emails.</p>
              ) : (
                failed.map((email) => <EmailItem key={email.id} email={email} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
