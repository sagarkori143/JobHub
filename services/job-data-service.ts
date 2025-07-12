import type { JobListing } from "@/types/job-search"
import { mockJobs } from "@/data/mock-jobs"
import { notificationHashmapService } from "@/services/notification-hashmap-service"

export interface JobMetadata {
  lastUpdated: string
  totalJobs: number
  companies: Record<
    string,
    {
      total: number
      active: number
      expired: number
    }
  >
  hasRealData?: boolean
  scrapingSession?: {
    timestamp: string
    companiesProcessed: number
    totalActiveJobs: number
  }
}

class JobDataService {
  private jobs: JobListing[] = []
  private metadata: JobMetadata | null = null

  async loadJobs(): Promise<JobListing[]> {
    // In a real implementation, this would load from a database or API
    // For now, we'll use mock data
    this.jobs = [...mockJobs]
    
    // Fetch actual last update time from database
    try {
      const response = await fetch('/api/jobs/metadata')
      if (response.ok) {
        const data = await response.json()
        this.metadata = {
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          totalJobs: this.jobs.length,
          companies: this.getCompanyStats(),
          hasRealData: data.hasData
        }
      } else {
        // Fallback to current time if API fails
        this.metadata = {
          lastUpdated: new Date().toISOString(),
          totalJobs: this.jobs.length,
          companies: this.getCompanyStats(),
          hasRealData: false
        }
      }
    } catch (error) {
      console.error('Error fetching job metadata:', error)
      // Fallback to current time if API fails
      this.metadata = {
        lastUpdated: new Date().toISOString(),
        totalJobs: this.jobs.length,
        companies: this.getCompanyStats(),
        hasRealData: false
      }
    }
    
    return this.jobs
  }

  async getJobs(): Promise<{ jobs: JobListing[]; metadata: JobMetadata | null }> {
    if (this.jobs.length === 0) {
      await this.loadJobs()
    }
    return { jobs: this.jobs, metadata: this.metadata }
  }

  async refreshJobs(): Promise<void> {
    // Simulate fetching new jobs
    const newJobs = mockJobs.slice(0, 5).map((job, index) => ({
      ...job,
      id: `new-${Date.now()}-${index}`,
      postedDate: new Date().toISOString().split('T')[0],
    }))

    // Add new jobs to the existing list
    this.jobs = [...newJobs, ...this.jobs]

    // Update metadata
    this.metadata = {
      lastUpdated: new Date().toISOString(),
      totalJobs: this.jobs.length,
      companies: this.getCompanyStats(),
      scrapingSession: {
        timestamp: new Date().toISOString(),
        companiesProcessed: 5,
        totalActiveJobs: newJobs.length,
      },
    }

    // Trigger notifications for new jobs using hash map service
    await this.triggerNotifications(newJobs)
  }

  private async triggerNotifications(newJobs: JobListing[]): Promise<void> {
    try {
      console.log(`📧 Triggering notifications for ${newJobs.length} new jobs using hash map service`)
      
      const response = await fetch('/api/notifications/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newJobs }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`📧 Notifications processed: ${data.message}`)
        console.log(`📊 Hash map stats:`, data.stats)
      } else {
        console.error('Failed to trigger notifications')
      }
    } catch (error) {
      console.error('Error triggering notifications:', error)
    }
  }

  getMetadata(): JobMetadata | null {
    return this.metadata
  }

  private getCompanyStats(): Record<string, { total: number; active: number; expired: number }> {
    const stats: Record<string, { total: number; active: number; expired: number }> = {}

    this.jobs.forEach((job) => {
      if (!stats[job.company]) {
        stats[job.company] = { total: 0, active: 0, expired: 0 }
      }

      stats[job.company].total++
      if (job.isActive) {
        stats[job.company].active++
      } else {
        stats[job.company].expired++
      }
    })

    return stats
  }
}

export const jobDataService = new JobDataService()




