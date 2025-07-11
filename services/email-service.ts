import type { JobListing } from "@/types/job-search"
import type { EmailRecipient } from "@/types/email"

// Mock user subscriptions based on job preferences
// In a real app, this would come from a database
const mockSubscriptions: Record<string, string[]> = {
  "sagar@example.com": ["Technology", "React", "Remote", "Senior"],
  "alice@example.com": ["Technology", "Remote", "Senior"],
  "bob@example.com": ["React", "Mid"],
  "charlie@example.com": ["Finance", "Remote"],
  "david@example.com": ["Marketing", "Mid"],
  "eve@example.com": ["Design"],
}

// Mock new jobs to trigger alerts (expanded for more variety)
const allMockJobs: JobListing[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    company: "Google",
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
    id: "job-2",
    title: "Product Designer",
    company: "Apple",
    location: "Cupertino, CA",
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
    id: "job-3",
    title: "Financial Analyst",
    company: "Microsoft",
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
  {
    id: "job-4",
    title: "Software Engineer",
    company: "Amazon",
    location: "Seattle, WA",
    type: "Full-time",
    salary: { min: 110000, max: 160000, currency: "USD" },
    description: "Develop scalable software solutions for our cloud platform.",
    requirements: ["Java", "AWS", "Distributed Systems"],
    benefits: ["Health", "401k", "Stock Options"],
    postedDate: "2024-07-11",
    applicationDeadline: "2024-08-11",
    industry: "Technology",
    experienceLevel: "Mid",
    remote: false,
    companyLogo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "job-5",
    title: "Marketing Specialist",
    company: "Netflix",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: { min: 80000, max: 120000, currency: "USD" },
    description: "Drive marketing campaigns for our new content.",
    requirements: ["Digital Marketing", "Content Creation", "Analytics"],
    benefits: ["Health", "Unlimited PTO"],
    postedDate: "2024-07-10",
    applicationDeadline: "2024-08-10",
    industry: "Marketing",
    experienceLevel: "Entry",
    remote: false,
    companyLogo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "job-6",
    title: "Data Scientist",
    company: "Uber",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: { min: 120000, max: 180000, currency: "USD" },
    description: "Apply statistical methods and machine learning to large datasets.",
    requirements: ["Python", "SQL", "Machine Learning"],
    benefits: ["Health", "Stock Options", "Commuter Benefits"],
    postedDate: "2024-07-09",
    applicationDeadline: "2024-08-09",
    industry: "Technology",
    experienceLevel: "Senior",
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
  private simulationInterval: NodeJS.Timeout | null = null

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Starts a continuous simulation of new job alerts being detected and queued
  startContinuousAlertsSimulation(intervalMs = 2000) {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
    }
    console.log("Starting continuous email alert simulation...")
    this.simulationInterval = setInterval(() => {
      const randomJob = allMockJobs[Math.floor(Math.random() * allMockJobs.length)]
      this.sendNewJobAlerts([randomJob])
    }, intervalMs)
  }

  stopContinuousAlertsSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
      console.log("Stopped continuous email alert simulation.")
    }
  }

  // Simulates detecting new jobs and queuing emails
  sendNewJobAlerts(newJobs: JobListing[]): boolean {
    if (newJobs.length === 0) {
      return false
    }

    const recipientsToSend: Record<string, EmailRecipient> = {}

    newJobs.forEach((job) => {
      // Iterate through mockSubscriptions by email to find matching preferences
      Object.entries(mockSubscriptions).forEach(([email, preferences]) => {
        const jobKeywords = [
          job.title,
          job.description,
          job.industry,
          job.experienceLevel,
          job.remote ? "Remote" : "",
        ].map((s) => s.toLowerCase())

        // Check if any of the user's preferences match job keywords
        const matchesPreference = preferences.some((pref) =>
          jobKeywords.some((keyword) => keyword.includes(pref.toLowerCase())),
        )

        if (matchesPreference) {
          const recipientId = `${email}-${job.id}` // Unique ID for this email-job pair
          if (!recipientsToSend[recipientId]) {
            recipientsToSend[recipientId] = {
              id: recipientId,
              email,
              jobTitle: job.title,
              company: job.company,
              status: "queued",
              timestamp: new Date().toISOString(),
              message: `Sending notification to ${email.split("@")[0]} for a new ${job.title} job opening at ${job.company}.`,
            }
          }
        }
      })
    })

    const newRecipients = Object.values(recipientsToSend)
    if (newRecipients.length > 0) {
      this.queuedEmails.push(...newRecipients)
      this.startSendingProcess()
      return true
    } else {
      return false
    }
  }

  private startSendingProcess() {
    if (this.sendingInterval) {
      // If already sending, don't start a new interval
      return
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
          Math.random() * 1500 + 500, // 0.5 to 2 seconds
        )
      } else if (this.sendingEmails.length === 0) {
        // All emails processed from the current queue
        clearInterval(this.sendingInterval!)
        this.sendingInterval = null
      }
    }, 300) // Process a new email every 300ms if available
  }

  private completeSending(email: EmailRecipient) {
    this.sendingEmails = this.sendingEmails.filter((e) => e.id !== email.id)

    // Simulate success or failure
    if (Math.random() > 0.1) {
      // 90% success rate
      email.status = "sent"
      email.message = `Notification sent to ${email.email.split("@")[0]} for ${email.jobTitle} at ${email.company}.`
      email.timestamp = new Date().toISOString()
      this.sentEmails.push(email)
    } else {
      // 10% failure rate
      email.status = "failed"
      email.message = `Failed to send notification to ${email.email.split("@")[0]} for ${email.jobTitle} at ${email.company}.`
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
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }
  }
}

export const emailService = EmailService.getInstance()
