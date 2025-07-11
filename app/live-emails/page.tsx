"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { emailService } from "@/services/email-service"
import type { EmailRecipient } from "@/types/email"
import { RefreshCcw, Play, Pause, RotateCcw } from "lucide-react"

export default function LiveEmailsPage() {
  const [emailStatus, setEmailStatus] = useState<{
    queued: EmailRecipient[]
    sending: EmailRecipient[]
    sent: EmailRecipient[]
    failed: EmailRecipient[]
  }>({
    queued: [],
    sending: [],
    sent: [],
    failed: [],
  })
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateStatus = () => {
    setEmailStatus(emailService.getEmailStatus())
  }

  const startSimulation = () => {
    emailService.startSimulation()
    setIsSimulationRunning(true)
    if (!intervalRef.current) {
      intervalRef.current = setInterval(updateStatus, 500) // Update UI every 0.5 seconds
    }
  }

  const stopSimulation = () => {
    emailService.stopSimulation()
    setIsSimulationRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const resetSimulation = () => {
    stopSimulation() // Ensure simulation is stopped before resetting
    emailService.resetEmails()
    setEmailStatus(emailService.getEmailStatus()) // Clear UI immediately
  }

  // Start simulation automatically when component mounts
  useEffect(() => {
    startSimulation()
    return () => {
      stopSimulation() // Clean up on unmount
    }
  }, [])

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-3xl font-bold mb-6">Live Email Status</h1>

      <div className="flex gap-4 mb-6">
        <Button onClick={isSimulationRunning ? stopSimulation : startSimulation}>
          {isSimulationRunning ? (
            <>
              <Pause className="mr-2 h-4 w-4" /> Pause Simulation
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" /> Start Simulation
            </>
          )}
        </Button>
        <Button variant="outline" onClick={resetSimulation}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset All
        </Button>
        <Button variant="outline" onClick={updateStatus}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Queued ({emailStatus.queued.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full max-h-96 pr-4">
              {emailStatus.queued.length === 0 ? (
                <p className="text-sm text-muted-foreground">No emails in queue.</p>
              ) : (
                <ul className="space-y-2">
                  {emailStatus.queued.map((email) => (
                    <li key={email.id} className="p-2 border rounded-md bg-blue-50 text-sm">
                      <p className="font-medium truncate">{email.email}</p>
                      <p className="text-xs text-muted-foreground">{email.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleTimeString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Sending ({emailStatus.sending.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full max-h-96 pr-4">
              {emailStatus.sending.length === 0 ? (
                <p className="text-sm text-muted-foreground">No emails currently sending.</p>
              ) : (
                <ul className="space-y-2">
                  {emailStatus.sending.map((email) => (
                    <li key={email.id} className="p-2 border rounded-md bg-yellow-50 text-sm">
                      <p className="font-medium truncate">{email.email}</p>
                      <p className="text-xs text-muted-foreground">{email.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleTimeString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Sent ({emailStatus.sent.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full max-h-96 pr-4">
              {emailStatus.sent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No emails sent yet.</p>
              ) : (
                <ul className="space-y-2">
                  {emailStatus.sent.map((email) => (
                    <li key={email.id} className="p-2 border rounded-md bg-green-50 text-sm">
                      <p className="font-medium truncate">{email.email}</p>
                      <p className="text-xs text-muted-foreground">{email.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleTimeString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Failed ({emailStatus.failed.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full max-h-96 pr-4">
              {emailStatus.failed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No failed emails.</p>
              ) : (
                <ul className="space-y-2">
                  {emailStatus.failed.map((email) => (
                    <li key={email.id} className="p-2 border rounded-md bg-red-50 text-sm">
                      <p className="font-medium truncate">{email.email}</p>
                      <p className="text-xs text-muted-foreground">{email.message}</p>
                      <p className="text-xs text-muted-foreground">{new Date(email.timestamp).toLocaleTimeString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
