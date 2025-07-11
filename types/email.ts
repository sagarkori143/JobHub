export type EmailStatus = "queued" | "sending" | "sent" | "failed"

export interface EmailRecipient {
  id: string
  email: string
  jobTitle: string
  company: string
  status: EmailStatus
  timestamp: string // ISO string
  message: string // Custom message for display
}
