import { supabase } from "@/lib/supabase"
import type { JobListing } from "@/types/job-search"

export interface JobPreferences {
  keywords: string[]
  industries: string[]
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

export class EmailNotificationService {
  private tempNewJobs: JobListing[] = []
  private notificationQueue: Array<{
    userId: string
    userEmail: string
    userName: string
    jobs: NotificationJob[]
  }> = []

  // Add new jobs to temporary array
  addNewJobs(jobs: JobListing[]) {
    this.tempNewJobs.push(...jobs)
    console.log(`📧 Added ${jobs.length} new jobs to notification queue`)
  }

  // Clear temporary jobs after processing
  clearTempJobs() {
    this.tempNewJobs = []
  }

  // Check if job matches user preferences
  private jobMatchesPreferences(job: JobListing, preferences: JobPreferences): { matches: boolean; criteria: string[] } {
    const matchedCriteria: string[] = []

    // Check keywords
    const keywordMatches = preferences.keywords.some(keyword =>
      job.title.toLowerCase().includes(keyword.toLowerCase()) ||
      job.description.toLowerCase().includes(keyword.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(keyword.toLowerCase()))
    )
    if (keywordMatches) {
      matchedCriteria.push('keywords')
    }

    // Check industries
    if (preferences.industries.length === 0 || preferences.industries.includes(job.industry)) {
      matchedCriteria.push('industry')
    }

    // Check locations
    const locationMatches = preferences.locations.length === 0 ||
      preferences.locations.some(location => {
        if (location.toLowerCase() === 'remote' && job.remote) return true
        return job.location.toLowerCase().includes(location.toLowerCase())
      })
    if (locationMatches) {
      matchedCriteria.push('location')
    }

    // Check job types
    if (preferences.jobTypes.length === 0 || preferences.jobTypes.includes(job.type)) {
      matchedCriteria.push('job type')
    }

    // Check experience levels
    if (preferences.experienceLevels.length === 0 || preferences.experienceLevels.includes(job.experienceLevel)) {
      matchedCriteria.push('experience level')
    }

    // Check salary range
    const avgSalary = (job.salary.min + job.salary.max) / 2
    if (avgSalary >= preferences.salaryRange.min && avgSalary <= preferences.salaryRange.max) {
      matchedCriteria.push('salary range')
    }

    return {
      matches: matchedCriteria.length > 0,
      criteria: matchedCriteria
    }
  }

  // Get all users with their preferences
  private async getUsersWithPreferences(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, job_preferences')
      .not('job_preferences', 'is', null)

    if (error) {
      console.error('Error fetching users with preferences:', error)
      return []
    }

    return data || []
  }

  // Check if notification was already sent
  private async hasNotificationBeenSent(userId: string, jobId: string): Promise<boolean> {
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
  private async recordNotificationSent(userId: string, jobId: string, status: string = 'sent', errorMessage?: string) {
    const { error } = await supabase
      .from('job_notifications')
      .insert({
        user_id: userId,
        job_id: jobId,
        notification_type: 'email',
        status,
        error_message: errorMessage
      })

    if (error) {
      console.error('Error recording notification:', error)
    }
  }

  // Send email notification (mock implementation)
  private async sendEmailNotification(userEmail: string, userName: string, jobs: NotificationJob[]): Promise<boolean> {
    try {
      // In a real implementation, you would use a service like SendGrid, AWS SES, or Resend
      console.log(`📧 Sending email to ${userEmail} for ${jobs.length} matching jobs`)
      
      // Mock email sending - replace with actual email service
      const emailContent = this.generateEmailContent(userName, jobs)
      console.log('Email content:', emailContent)
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return true
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }

  // Generate email content
  private generateEmailContent(userName: string, jobs: NotificationJob[]): string {
    const jobList = jobs.map(({ job, matchedCriteria }) => {
      const criteriaText = matchedCriteria.join(', ')
      return `
        🏢 ${job.company} - ${job.title}
        📍 ${job.location} (${job.remote ? 'Remote' : 'On-site'})
        💰 $${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}
        🏷️ Matched: ${criteriaText}
        📅 Posted: ${new Date(job.postedDate).toLocaleDateString()}
        🔗 View Job: https://jobhub.com/jobs/${job.id}
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

  // Process notifications for all users
  async processNotifications(): Promise<void> {
    if (this.tempNewJobs.length === 0) {
      console.log('📧 No new jobs to process for notifications')
      return
    }

    console.log(`📧 Processing notifications for ${this.tempNewJobs.length} new jobs`)

    try {
      // Get all users with preferences
      const users = await this.getUsersWithPreferences()
      console.log(`📧 Found ${users.length} users with preferences`)

      // Process each user
      for (const user of users) {
        if (!user.job_preferences?.notifications?.email) {
          continue // Skip if email notifications are disabled
        }

        const matchingJobs: NotificationJob[] = []

        // Check each new job against user preferences
        for (const job of this.tempNewJobs) {
          const { matches, criteria } = this.jobMatchesPreferences(job, user.job_preferences)
          
          if (matches) {
            // Check if notification was already sent
            const alreadySent = await this.hasNotificationBeenSent(user.id, job.id)
            if (!alreadySent) {
              matchingJobs.push({ job, matchedCriteria: criteria })
            }
          }
        }

        // Send notification if there are matching jobs
        if (matchingJobs.length > 0) {
          console.log(`📧 Sending notification to ${user.email} for ${matchingJobs.length} jobs`)
          
          const success = await this.sendEmailNotification(
            user.email,
            user.full_name || user.email.split('@')[0],
            matchingJobs
          )

          // Record notifications
          for (const { job } of matchingJobs) {
            await this.recordNotificationSent(
              user.id,
              job.id,
              success ? 'sent' : 'failed',
              success ? undefined : 'Email sending failed'
            )
          }
        }
      }

      console.log(`📧 Notification processing completed`)
      
      // Clear temporary jobs after processing
      this.clearTempJobs()

    } catch (error) {
      console.error('Error processing notifications:', error)
    }
  }

  // Get notification history for a user
  async getUserNotificationHistory(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('job_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notification history:', error)
      return []
    }

    return data || []
  }

  // Get notification statistics
  async getNotificationStats() {
    const { data, error } = await supabase
      .from('job_notifications')
      .select('status, notification_type, sent_at')

    if (error) {
      console.error('Error fetching notification stats:', error)
      return null
    }

    const stats = {
      total: data.length,
      sent: data.filter(n => n.status === 'sent').length,
      failed: data.filter(n => n.status === 'failed').length,
      pending: data.filter(n => n.status === 'pending').length,
      byType: {
        email: data.filter(n => n.notification_type === 'email').length,
        sms: data.filter(n => n.notification_type === 'sms').length,
        whatsapp: data.filter(n => n.notification_type === 'whatsapp').length,
      }
    }

    return stats
  }
}

export const emailNotificationService = new EmailNotificationService() 