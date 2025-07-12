import { createServerSupabaseClient } from "@/lib/supabase"
import type { JobListing } from "@/types/job-search"
import { sendRealEmail } from '@/lib/real-email';

export interface JobPreferences {
  keywords: string[]
  industries: string[]
  companies: string[]
  locations: string[]
  jobTypes: string[]
  experienceLevels: string[]
  salaryRange: {
    min: number
    max: number
  }
  notifications: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  job_preferences: JobPreferences
}

export interface NotificationJob {
  job: JobListing
  matchedCriteria: string[]
}

// Hash map structures for efficient lookups
export interface PreferenceHashMaps {
  techStacks: Record<string, string[]> // techStack -> [email1, email2, ...]
  companies: Record<string, string[]> // company -> [email1, email2, ...]
  industries: Record<string, string[]> // industry -> [email1, email2, ...]
  locations: Record<string, string[]> // location -> [email1, email2, ...]
  jobTypes: Record<string, string[]> // jobType -> [email1, email2, ...]
  experienceLevels: Record<string, string[]> // experienceLevel -> [email1, email2, ...]
}

export interface UserEmailQueue {
  [userEmail: string]: {
    matchedJobs: string[]
    userName: string
    userId: string
  }
}

export class NotificationHashmapService {
  private preferenceHashMaps: PreferenceHashMaps = {
    techStacks: {},
    companies: {},
    industries: {},
    locations: {},
    jobTypes: {},
    experienceLevels: {},
  }

  private userEmailQueue: UserEmailQueue = {}
  private tempNewJobs: JobListing[] = []

  // Add new jobs to temporary array
  addNewJobs(jobs: JobListing[]) {
    this.tempNewJobs.push(...jobs)
    console.log(`📧 Added ${jobs.length} new jobs to notification queue`)
  }

  // Clear temporary jobs after processing
  clearTempJobs() {
    this.tempNewJobs = []
  }

  // Build hash maps from user preferences
  async buildPreferenceHashMaps(): Promise<void> {
    console.log("🔧 Building preference hash maps...")
    
    // Reset hash maps
    this.preferenceHashMaps = {
      techStacks: {},
      companies: {},
      industries: {},
      locations: {},
      jobTypes: {},
      experienceLevels: {},
    }

    // Use service role key for unrestricted access
    const supabase = createServerSupabaseClient();
    // Get all users with preferences
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, job_preferences')
      .not('job_preferences', 'is', null)

    if (error) {
      console.error('Error fetching users with preferences:', error)
      return
    }

    if (!users) return

    console.log(`🔍 Found ${users.length} users with preferences:`)
    users.forEach((user: UserProfile) => {
      console.log(`  - ${user.email}:`, user.job_preferences)
      if (!user.job_preferences?.notifications?.email) {
        console.log(`    ❌ Email notifications disabled for ${user.email}`)
        return
      }

      const job_preferences: JobPreferences = user.job_preferences;

      // Add tech stacks (keywords)
      ensureArray(job_preferences.keywords).forEach((keyword: string) => {
        const normalizedKeyword = keyword.toLowerCase().trim()
        if (!this.preferenceHashMaps.techStacks[normalizedKeyword]) {
          this.preferenceHashMaps.techStacks[normalizedKeyword] = []
        }
        this.preferenceHashMaps.techStacks[normalizedKeyword].push(user.email)
      })

      // Add industries
      ensureArray(job_preferences.industries).forEach((industry: string) => {
        if (!this.preferenceHashMaps.industries[industry]) {
          this.preferenceHashMaps.industries[industry] = []
        }
        this.preferenceHashMaps.industries[industry].push(user.email)
        console.log(`    ✅ Added industry: ${industry} for ${user.email}`)
      })

      // Add companies
      ensureArray(job_preferences.companies).forEach((company: string) => {
        if (!this.preferenceHashMaps.companies[company]) {
          this.preferenceHashMaps.companies[company] = []
        }
        this.preferenceHashMaps.companies[company].push(user.email)
        console.log(`    ✅ Added company: ${company} for ${user.email}`)
      })

      // Add locations
      ensureArray(job_preferences.locations).forEach((location: string) => {
        const normalizedLocation = location.toLowerCase().trim()
        if (!this.preferenceHashMaps.locations[normalizedLocation]) {
          this.preferenceHashMaps.locations[normalizedLocation] = []
        }
        this.preferenceHashMaps.locations[normalizedLocation].push(user.email)
      })

      // Add job types
      ensureArray(job_preferences.jobTypes).forEach((jobType: string) => {
        if (!this.preferenceHashMaps.jobTypes[jobType]) {
          this.preferenceHashMaps.jobTypes[jobType] = []
        }
        this.preferenceHashMaps.jobTypes[jobType].push(user.email)
      })

      // Add experience levels
      ensureArray(job_preferences.experienceLevels).forEach((experienceLevel: string) => {
        if (!this.preferenceHashMaps.experienceLevels[experienceLevel]) {
          this.preferenceHashMaps.experienceLevels[experienceLevel] = []
        }
        this.preferenceHashMaps.experienceLevels[experienceLevel].push(user.email)
      })
    })

    console.log("✅ Hash maps built successfully")
    console.log("📊 Hash map statistics:")
    console.log(`   Tech Stacks: ${Object.keys(this.preferenceHashMaps.techStacks).length}`)
    console.log(`   Industries: ${Object.keys(this.preferenceHashMaps.industries).length}`)
    console.log(`   Companies: ${Object.keys(this.preferenceHashMaps.companies).length}`)
    console.log(`   Locations: ${Object.keys(this.preferenceHashMaps.locations).length}`)
    console.log(`   Job Types: ${Object.keys(this.preferenceHashMaps.jobTypes).length}`)
    console.log(`   Experience Levels: ${Object.keys(this.preferenceHashMaps.experienceLevels).length}`)
  }

  // Check if job matches preferences using hash maps
  private jobMatchesPreferences(job: JobListing): { matches: boolean; matchedUsers: Set<string>; criteria: string[] } {
    const matchedUsers = new Set<string>()
    const criteria: string[] = []

    // Check tech stacks (keywords)
    const jobText = `${job.title} ${job.description} ${job.requirements.join(' ')}`.toLowerCase()
    Object.keys(this.preferenceHashMaps.techStacks).forEach(keyword => {
      if (jobText.includes(keyword.toLowerCase())) {
        this.preferenceHashMaps.techStacks[keyword].forEach(email => matchedUsers.add(email))
        criteria.push(`tech:${keyword}`)
      }
    })

    // Check industries
    if (this.preferenceHashMaps.industries[job.industry]) {
      this.preferenceHashMaps.industries[job.industry].forEach(email => matchedUsers.add(email))
      criteria.push(`industry:${job.industry}`)
    }

    // Check companies
    if (this.preferenceHashMaps.companies[job.company]) {
      this.preferenceHashMaps.companies[job.company].forEach(email => matchedUsers.add(email))
      criteria.push(`company:${job.company}`)
    }

    // Check locations
    const jobLocation = job.location.toLowerCase()
    Object.keys(this.preferenceHashMaps.locations).forEach(location => {
      if (location === 'remote' && job.remote) {
        this.preferenceHashMaps.locations[location].forEach(email => matchedUsers.add(email))
        criteria.push('location:remote')
      } else if (jobLocation.includes(location.toLowerCase())) {
        this.preferenceHashMaps.locations[location].forEach(email => matchedUsers.add(email))
        criteria.push(`location:${location}`)
      }
    })

    // Check job types
    if (this.preferenceHashMaps.jobTypes[job.type]) {
      this.preferenceHashMaps.jobTypes[job.type].forEach(email => matchedUsers.add(email))
      criteria.push(`jobType:${job.type}`)
    }

    // Check experience levels
    if (this.preferenceHashMaps.experienceLevels[job.experienceLevel]) {
      this.preferenceHashMaps.experienceLevels[job.experienceLevel].forEach(email => matchedUsers.add(email))
      criteria.push(`experience:${job.experienceLevel}`)
    }

    return {
      matches: matchedUsers.size > 0,
      matchedUsers,
      criteria
    }
  }

  // Build user email queue from matched jobs
  private async buildUserEmailQueue(): Promise<void> {
    console.log("📧 Building user email queue...")
    
    this.userEmailQueue = {}

    // Get all users for reference
    const supabase = createServerSupabaseClient();
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .not('job_preferences', 'is', null)

    if (error || !users) {
      console.error('Error fetching users:', error)
      return
    }

    const userMap = new Map(users.map(u => [u.email, u]))

    // Process each new job
    for (const job of this.tempNewJobs) {
      const { matches, matchedUsers, criteria } = this.jobMatchesPreferences(job)
      
      if (matches) {
        console.log(`📧 Job ${job.id} matches ${matchedUsers.size} users`)
        
        // Add to user email queue
        matchedUsers.forEach(userEmail => {
          const user = userMap.get(userEmail)
          if (!user) return

          if (!this.userEmailQueue[userEmail]) {
            this.userEmailQueue[userEmail] = {
              matchedJobs: [],
              userName: user.full_name || userEmail.split('@')[0],
              userId: user.id
            }
          }
          
          this.userEmailQueue[userEmail].matchedJobs.push(job.id)
        })
      }
    }

    console.log(`✅ User email queue built with ${Object.keys(this.userEmailQueue).length} users`)
  }

  // Check if notification was already sent
  private async hasNotificationBeenSent(userId: string, jobId: string): Promise<boolean> {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('job_notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .eq('notification_type', 'email')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking notification status:', error)
      return false
    }

    return !!data
  }

  // Record notification as sent
  private async recordNotificationSent(userId: string, jobId: string, status: string = 'sent', errorMessage?: string, notificationPayload?: any) {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('job_notifications')
      .insert({
        user_id: userId,
        job_id: jobId,
        notification_type: 'email',
        status,
        error_message: errorMessage,
        notification_payload: notificationPayload
      })

    if (error) {
      console.error('Error recording notification:', error)
    }
  }

  // Send structured email to users
  private async sendStructuredEmails(ignoreNotificationHistory?: boolean): Promise<void> {
    console.log(`📧 Sending structured emails to ${Object.keys(this.userEmailQueue).length} users`)

    for (const [userEmail, userData] of Object.entries(this.userEmailQueue)) {
      try {
        // Filter out jobs that have already been notified, unless ignoring history
        let jobsToNotify = []
        if (ignoreNotificationHistory) {
          jobsToNotify = userData.matchedJobs
        } else {
          for (const jobId of userData.matchedJobs) {
            const alreadySent = await this.hasNotificationBeenSent(userData.userId, jobId)
            if (!alreadySent) {
              jobsToNotify.push(jobId)
            }
          }
        }

        if (jobsToNotify.length === 0) {
          console.log(`📧 No new jobs to notify ${userEmail}`)
          continue
        }

        // Get job details for the email
        const jobDetails = this.tempNewJobs.filter(job => jobsToNotify.includes(job.id))
        
        // Send email
        const emailContent = this.generateStructuredEmailContent(userData.userName, jobDetails)
        const success = await this.sendEmailNotification(userEmail, userData.userName, jobDetails)

        // Record notifications (only if not ignoring history)
        if (!ignoreNotificationHistory) {
          for (const jobId of jobsToNotify) {
            // Find the job info for this jobId
            const jobInfo = jobDetails.find(job => job.id === jobId);
            // Only store simple job info
            const simpleJobInfo = jobInfo ? {
              id: jobInfo.id,
              company: jobInfo.company,
              title: jobInfo.title,
              location: jobInfo.location,
              postedDate: jobInfo.postedDate,
              industry: jobInfo.industry,
              type: jobInfo.type,
              experienceLevel: jobInfo.experienceLevel,
              remote: jobInfo.remote,
              salary: jobInfo.salary
            } : undefined;
            await this.recordNotificationSent(
              userData.userId,
              jobId,
              success ? 'sent' : 'failed',
              success ? undefined : 'Email sending failed',
              simpleJobInfo ? { job: simpleJobInfo } : undefined
            )
          }
        }

        console.log(`📧 Email sent to ${userEmail} for ${jobsToNotify.length} jobs`)

      } catch (error) {
        console.error(`Error sending email to ${userEmail}:`, error)
      }
    }
  }

  // Send email notification (real implementation with Resend)
  private async sendEmailNotification(userEmail: string, userName: string, jobs: JobListing[]): Promise<boolean> {
    try {
      const emailContent = this.generateStructuredEmailContent(userName, jobs);
      await sendRealEmail({
        to: userEmail,
        subject: `JobHub: ${jobs.length} new job(s) for you`,
        text: emailContent,
      });
      return true;
    } catch (error) {
      console.error('Error sending real email:', error);
      return false;
    }
  }

  // Generate structured email content
  private generateStructuredEmailContent(userName: string, jobs: JobListing[]): string {
    const jobList = jobs.map(job => {
      return `
        🏢 ${job.company} - ${job.title}
        📍 ${job.location} (${job.remote ? 'Remote' : 'On-site'})
        💰 $${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}
        🏷️ ${job.industry} • ${job.type} • ${job.experienceLevel}
        📅 Posted: ${new Date(job.postedDate).toLocaleDateString()}
        🔗 View Job: https://job-hub-wheat.vercel.app/
      `
    }).join('\n\n')

    return `
      Hi ${userName},

      We found ${jobs.length} new job(s) that match your preferences!

      ${jobList}

      Best regards,
      JobHub Team
    `
  }

  // Main process function
  async processNotifications(testUserEmail?: string, ignoreNotificationHistory?: boolean): Promise<void> {
    if (this.tempNewJobs.length === 0) {
      console.log('📧 No new jobs to process for notifications')
      return
    }

    console.log(`📧 Processing notifications for ${this.tempNewJobs.length} new jobs`)

    try {
      // Step 1: Build preference hash maps
      await this.buildPreferenceHashMaps()

      // Step 2: Build user email queue
      await this.buildUserEmailQueue()

      // If testUserEmail is provided, filter the queue to only that user
      if (testUserEmail) {
        console.log(`🔬 Test mode: Only sending notifications to ${testUserEmail}`)
        if (this.userEmailQueue[testUserEmail]) {
          this.userEmailQueue = { [testUserEmail]: this.userEmailQueue[testUserEmail] }
        } else {
          this.userEmailQueue = {}
        }
      }

      // Step 3: Send structured emails
      await this.sendStructuredEmails(ignoreNotificationHistory)

      console.log(`📧 Notification processing completed`)
      // Clear temporary jobs after processing
      this.clearTempJobs()
    } catch (error) {
      console.error('Error processing notifications:', error)
    }
  }

  // Get hash map statistics
  getHashMapStats() {
    return {
      techStacks: Object.keys(this.preferenceHashMaps.techStacks).length,
      industries: Object.keys(this.preferenceHashMaps.industries).length,
      locations: Object.keys(this.preferenceHashMaps.locations).length,
      jobTypes: Object.keys(this.preferenceHashMaps.jobTypes).length,
      experienceLevels: Object.keys(this.preferenceHashMaps.experienceLevels).length,
      userEmailQueue: Object.keys(this.userEmailQueue).length
    }
  }

  // Get hash map details for debugging
  getHashMapDetails() {
    return {
      preferenceHashMaps: this.preferenceHashMaps,
      userEmailQueue: this.userEmailQueue
    }
  }
}

function ensureArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export const notificationHashmapService = new NotificationHashmapService() 