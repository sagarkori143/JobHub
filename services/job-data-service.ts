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
    try {
      // Try to load from merged posts.json file first
      const response = await fetch('/api/jobs')
      if (response.ok) {
        const data = await response.json()
        
        if (data.jobs && data.jobs.length > 0) {
          // Use real data from merged file
          this.jobs = data.jobs
          this.metadata = {
            lastUpdated: data.lastFetch || new Date().toISOString(),
            totalJobs: this.jobs.length,
            companies: this.getCompanyStats(),
            hasRealData: true
          }
          
          console.log(`📊 Loaded ${this.jobs.length} jobs from merged file`)
          return this.jobs
        }
      }
    } catch (error) {
      console.log('Could not load from merged file, falling back to mock data')
    }

    // Fallback to mock data if merged file is not present or empty
    console.log('📊 Using mock data as fallback')
    this.jobs = [...mockJobs]
    
    // Fetch metadata to check if real data exists
    try {
      const metadataResponse = await fetch('/api/jobs/metadata')
      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json()
        this.metadata = {
          lastUpdated: metadataData.lastUpdated || new Date().toISOString(),
          totalJobs: this.jobs.length,
          companies: this.getCompanyStats(),
          hasRealData: metadataData.hasData || false
        }
      } else {
        // Fallback metadata for mock data
        this.metadata = {
          lastUpdated: new Date().toISOString(),
          totalJobs: this.jobs.length,
          companies: this.getCompanyStats(),
          hasRealData: false
        }
      }
    } catch (error) {
      console.error('Error fetching job metadata:', error)
      // Fallback metadata for mock data
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
    // Reload jobs (this will check merged file first, then fallback to mock)
    await this.loadJobs()
    
    // Update metadata
    this.metadata = {
      lastUpdated: new Date().toISOString(),
      totalJobs: this.jobs.length,
      companies: this.getCompanyStats(),
      hasRealData: this.metadata?.hasRealData || false
    }
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
      if (job.isActive !== false) {
        stats[job.company].active++
      } else {
        stats[job.company].expired++
      }
    })

    return stats
  }
}

export const jobDataService = new JobDataService()




