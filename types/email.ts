export interface EmailRecipient {
  id: string
  email: string
  status: "queued" | "sending" | "sent" | "failed"
  timestamp: string // ISO string
  message?: string // For success or error messages
}
