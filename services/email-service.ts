import type { JobListing } from "@/types/job-search"
import type { EmailRecipient } from "@/types/email"
import { v4 as uuidv4 } from "uuid"

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

// In-memory store for email recipients and their statuses
let emailQueue: EmailRecipient[] = []
let sendingEmails: EmailRecipient[] = []
let sentEmails: EmailRecipient[] = []
let failedEmails: EmailRecipient[] = []

// Mock user subscriptions
const mockSubscribers = [
  { id: "user-1", email: "user1@example.com" },
  { id: "user-2", email: "user2@example.com" },
  { id: "user-3", email: "user3@example.com" },
  { id: "user-4", email: "user4@example.com" },
  { id: "user-5", email: "user5@example.com" },
  { id: "user-6", email: "user6@example.com" },
  { id: "user-7", email: "user7@example.com" },
  { id: "user-8", email: "user8@example.com" },
  { id: "user-9", email: "user9@example.com" },
  { id: "user-10", email: "user10@example.com" },
]

// Simulate a continuous email sending process
let simulationInterval: NodeJS.Timeout | null = null
let emailCounter = 0

const processQueue = () => {
  if (emailQueue.length > 0) {
    // Move some emails from queue to sending
    const numToProcess = Math.min(emailQueue.length, 3) // Process up to 3 at a time
    for (let i = 0; i < numToProcess; i++) {
      const email = emailQueue.shift()
      if (email) {
        email.status = "sending"
        email.timestamp = new Date().toISOString()
        sendingEmails.push(email)
        simulateSend(email)
      }
    }
  } else {
    // If queue is empty, add more mock emails
    addMockEmailsToQueue(5) // Add 5 new emails when queue is empty
  }
}

const simulateSend = (recipient: EmailRecipient) => {
  // Simulate async email sending
  setTimeout(
    () => {
      const success = Math.random() > 0.1 // 90% success rate
      recipient.timestamp = new Date().toISOString()

      sendingEmails = sendingEmails.filter((e) => e.id !== recipient.id) // Remove from sending

      if (success) {
        recipient.status = "sent"
        recipient.message = "Email sent successfully."
        sentEmails.push(recipient)
      } else {
        recipient.status = "failed"
        recipient.message = "Failed to send email: network error."
        failedEmails.push(recipient)
      }
    },
    Math.random() * 2000 + 500,
  ) // Simulate 0.5 to 2.5 seconds sending time
}

const addMockEmailsToQueue = (count: number) => {
  for (let i = 0; i < count; i++) {
    const subscriber = mockSubscribers[emailCounter % mockSubscribers.length]
    const newEmail: EmailRecipient = {
      id: uuidv4(),
      email: subscriber.email,
      status: "queued",
      timestamp: new Date().toISOString(),
      message: "Ready to send",
    }
    emailQueue.push(newEmail)
    emailCounter++
  }
}

export const emailService = {
  /**
   * Starts the continuous email simulation.
   * If already running, it does nothing.
   */
  startSimulation() {
    if (!simulationInterval) {
      console.log("Starting email simulation...")
      // Initialize with some emails if empty
      if (
        emailQueue.length === 0 &&
        sendingEmails.length === 0 &&
        sentEmails.length === 0 &&
        failedEmails.length === 0
      ) {
        addMockEmailsToQueue(10) // Add initial batch
      }
      simulationInterval = setInterval(processQueue, 1000) // Process queue every second
    }
  },

  /**
   * Stops the continuous email simulation.
   */
  stopSimulation() {
    if (simulationInterval) {
      console.log("Stopping email simulation...")
      clearInterval(simulationInterval)
      simulationInterval = null
    }
  },

  /**
   * Gets the current state of all email queues.
   * Returns deep copies to prevent external modification.
   */
  getEmailStatus(): {
    queued: EmailRecipient[]
    sending: EmailRecipient[]
    sent: EmailRecipient[]
    failed: EmailRecipient[]
  } {
    return {
      queued: JSON.parse(JSON.stringify(emailQueue)),
      sending: JSON.parse(JSON.stringify(sendingEmails)),
      sent: JSON.parse(JSON.stringify(sentEmails)),
      failed: JSON.parse(JSON.stringify(failedEmails)),
    }
  },

  /**
   * Resets all email queues.
   */
  resetEmails() {
    emailQueue = []
    sendingEmails = []
    sentEmails = []
    failedEmails = []
    emailCounter = 0
    this.stopSimulation() // Stop simulation when resetting
    console.log("Email queues reset.")
  },

  // Mock new jobs to trigger alerts (expanded for more variety)
  allMockJobs,

  // Mock user subscriptions based on job preferences
  // In a real app, this would come from a database
  mockSubscriptions,

  // Simulates detecting new jobs and queuing emails
  sendNewJobAlerts(newJobs: JobListing[]): boolean {
    if (newJobs.length === 0) {
      return false
    }

    const recipientsToSend: Record<string, EmailRecipient> = {}

    newJobs.forEach((job) => {
      // Iterate through mockSubscriptions by email to find matching preferences
      Object.entries(this.mockSubscriptions).forEach(([email, preferences]) => {
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
      this.emailQueue.push(...newRecipients)
      return true
    } else {
      return false
    }
  },
}
