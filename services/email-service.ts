import type { JobListing } from "@/types/job-search"
import type { EmailRecipient } from "@/types/email"

// Mock user subscriptions based on job preferences
// In a real app, this would come from a database
const mockSubscriptions: Record<string, string[]> = {
  Technology: ["sagar@example.com", "alice@example.com"],
  React: ["sagar@example.com", "bob@example.com"],
  Finance: ["charlie@example.com"],
  Remote: ["sagar@example.com", "alice@example.com", "charlie@example.com"],
  Marketing: ["david@example.com"],
  Design: ["eve@example.com"],
  Senior: ["sagar@example.com", "alice@example.com"],
  Mid: ["bob@example.com", "david@example.com"],
}

// Mock new jobs to trigger alerts (subset of mockJobs for demonstration)
const mockNewJobs: JobListing[] = [
  {
    id: "new-1",
    title: "Senior Frontend Engineer",
    company: "InnovateTech",
    location: "Remote",
    type: "Full-time",
    salary: { min: 130000, max: 190000, currency: "USD" },
    description: "Exciting opportunity for a Senior Frontend Engineer with React expertise.",
    requirements: ["React", "TypeScript", "5+ years experience"],
    benefits: ["Health", "Dental", "Remote work"],
    postedDate: "2024-07-10",
    applicationDeadline: "2024-08-10",
    industry: "Technology",
    experienceLevel: "Senior",
    remote: true,
    companyLogo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "new-2",
    title: "Product Designer",
    company: "CreativeFlow",
    location: "New York, NY",
    type: "Full-time",
    salary: { min: 90000, max: 140000, currency: "USD" },
    description: "Join our team as a Product Designer to shape user experiences.",
    requirements: ["UI/UX", "Figma", "Portfolio"],
    benefits: ["Health", "PTO"],
    postedDate: "2024-07-09",
    applicationDeadline: "2024-08-09",
    industry: "Design",
    experienceLevel: "Mid",
    remote: false,
    companyLogo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "new-3",
    title: "Financial Analyst",
    company: "GlobalInvest",
    location: "London, UK",
    type: "Full-time",
    salary: { min: 70000, max: 100000, currency: "GBP" },
    description: "Analyze market trends and provide financial insights.",
    requirements: ["Finance degree", "Excel", "Analytical skills"],
    benefits: ["Bonus", "Pension"],
    postedDate: "2024-07-08",
    applicationDeadline: "2024-08-08",
    industry: "Finance",
    experienceLevel: "Entry",
    remote: false,
    companyLogo: "/placeholder.svg?height=40&width=40",
  },
]

class EmailService {
  private static instance: EmailService
  private queuedEmails: EmailRecipient[] = []
  private sendingEmails: EmailRecipient[] = []
  private sentEmails: EmailRecipient[] = []
  private failedEmails: EmailRecipient[] = []
  private sendingInterval: NodeJS.Timeout | null = null

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Simulates detecting new jobs and queuing emails
  sendNewJobAlerts(newJobs: JobListing[] = mockNewJobs): boolean {
    if (newJobs.length === 0) {
      console.log("No new jobs to send alerts for.")
      return false
    }

    console.log(`Processing ${newJobs.length} new jobs for email alerts...`)
    const recipientsToSend: Record<string, EmailRecipient> = {} // Use a map to ensure unique recipients per job

    newJobs.forEach((job) => {
      const jobKeywords = [
        job.title,
        job.description,
        job.industry,
        job.experienceLevel,
        job.remote ? "Remote" : "",
      ].map((s) => s.toLowerCase())

      Object.entries(mockSubscriptions).forEach(([tag, emails]) => {
        if (jobKeywords.some((keyword) => keyword.includes(tag.toLowerCase()))) {
          emails.forEach((email) => {
            const recipientId = `${email}-${job.id}` // Unique ID for this email-job pair
            if (!recipientsToSend[recipientId]) {
              recipientsToSend[recipientId] = {
                id: recipientId,
                email,
                jobTitle: job.title,
                company: job.company,
                status: "queued",
                timestamp: new Date().toISOString(),
              }
            }
          })
        }
      })
    })

    const newRecipients = Object.values(recipientsToSend)
    if (newRecipients.length > 0) {
      this.queuedEmails.push(...newRecipients)
      console.log(`Queued ${newRecipients.length} emails for sending.`)
      this.startSendingProcess()
      return true
    } else {
      console.log("No matching subscribers found for new jobs.")
      return false
    }
  }

  private startSendingProcess() {
    if (this.sendingInterval) {
      clearInterval(this.sendingInterval)
    }

    this.sendingInterval = setInterval(() => {
      if (this.queuedEmails.length > 0) {
        // Move from queued to sending
        const email = this.queuedEmails.shift()!
        email.status = "sending"
        email.timestamp = new Date().toISOString()
        this.sendingEmails.push(email)

        // Simulate sending delay
        setTimeout(
          () => {
            this.completeSending(email)
          },
          Math.random() * 2000 + 500,
        ) // 0.5 to 2.5 seconds
      } else if (this.sendingEmails.length === 0) {
        // All emails processed
        clearInterval(this.sendingInterval!)
        this.sendingInterval = null
        console.log("Email sending simulation completed.")
      }
    }, 300) // Process a new email every 300ms if available
  }

  private completeSending(email: EmailRecipient) {
    this.sendingEmails = this.sendingEmails.filter((e) => e.id !== email.id)

    // Simulate success or failure
    if (Math.random() > 0.1) {
      // 90% success rate
      email.status = "sent"
      email.message = "Email sent successfully."
      email.timestamp = new Date().toISOString()
      this.sentEmails.push(email)
    } else {
      // 10% failure rate
      email.status = "failed"
      email.message = "Failed to send email."
      email.timestamp = new Date().toISOString()
      this.failedEmails.push(email)
    }
  }

  getQueueStatus() {
    return {
      queued: [...this.queuedEmails],
      sending: [...this.sendingEmails],
      sent: [...this.sentEmails],
      failed: [...this.failedEmails],
    }
  }

  clearAllEmails() {
    this.queuedEmails = []
    this.sendingEmails = []
    this.sentEmails = []
    this.failedEmails = []
    if (this.sendingInterval) {
      clearInterval(this.sendingInterval)
      this.sendingInterval = null
    }
    console.log("All email queues cleared.")
  }
}

export const emailService = EmailService.getInstance()
