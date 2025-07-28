import type { JobListing } from "@/types/job-search"
import { mockJobs } from "@/data/mock-jobs"

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
        
        if (data.jobs && Array.isArray(data.jobs) && data.jobs.length > 0) {
          // Validate job objects
          const validJobs = data.jobs.filter((job: any) => {
            return job && 
                   typeof job === 'object' && 
                   job.id && 
                   job.title && 
                   job.company
          })
          
          if (validJobs.length > 0) {
            // Use real data from merged file
            this.jobs = validJobs
            this.metadata = {
              lastUpdated: data.lastFetch || new Date().toISOString(),
              totalJobs: this.jobs.length,
              companies: this.getCompanyStats(),
              hasRealData: true
            }
            
            return this.jobs
          }
        }
      }
    } catch (error) {
      console.error('Error loading real job data:', error)
    }

    // Fallback to mock data if merged file is not present or empty
    try {
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
        console.error('Error fetching metadata:', error)
        // Fallback metadata for mock data
        this.metadata = {
          lastUpdated: new Date().toISOString(),
          totalJobs: this.jobs.length,
          companies: this.getCompanyStats(),
          hasRealData: false
        }
      }
    } catch (error) {
      console.error('Error loading mock jobs:', error)
      this.jobs = []
      this.metadata = {
        lastUpdated: new Date().toISOString(),
        totalJobs: 0,
        companies: {},
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
    try {
      // Reload jobs (this will check merged file first, then fallback to mock)
      await this.loadJobs()
      
      // Update metadata
      this.metadata = {
        lastUpdated: new Date().toISOString(),
        totalJobs: this.jobs.length,
        companies: this.getCompanyStats(),
        hasRealData: this.metadata?.hasRealData || false
      }
    } catch (error) {
      console.error('Error refreshing jobs:', error)
    }
  }

  private async triggerNotifications(newJobs: JobListing[]): Promise<void> {
    try {
      const response = await fetch('/api/notifications/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newJobs }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Notifications processed:', data)
      } else {
        console.error('Failed to process notifications:', response.status)
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

    try {
      this.jobs.forEach((job) => {
        if (!job || !job.company) {
          console.warn('Invalid job object found in stats calculation:', job)
          return
        }

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
    } catch (error) {
      console.error('Error calculating company stats:', error)
    }

    return stats
  }
}

export const jobDataService = new JobDataService()




