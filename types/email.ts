export type EmailStatus = "queued" | "sending" | "sent" | "failed"

export interface EmailRecipient {
  id: string // Unique ID for the email instance
  email: string
  jobTitle: string
  company: string
  status: EmailStatus
  timestamp: string // When it entered its current status
  message?: string // For success/failure messages
}
