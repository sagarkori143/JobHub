import type { JobListing } from "@/types/job-search"

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
  scrapingSession?: {
    timestamp: string
    companiesProcessed: number
    totalActiveJobs: number
  }
}

class JobDataService {
  private static instance: JobDataService
  private jobs: JobListing[] = []
  private metadata: JobMetadata | null = null
  private lastFetch = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): JobDataService {
    if (!JobDataService.instance) {
      JobDataService.instance = new JobDataService()
    }
    return JobDataService.instance
  }

  async loadJobs(forceRefresh = false): Promise<JobListing[]> {
    const now = Date.now()

    // Return cached data if still fresh
    if (!forceRefresh && this.jobs.length > 0 && now - this.lastFetch < this.CACHE_DURATION) {
      return this.jobs
    }

    try {
      // In a real application, this would fetch from your API or file system
      // For now, we'll simulate loading from the posts.json file
      const response = await fetch("/api/jobs")

      if (response.ok) {
        const data = await response.json()
        this.jobs = data.jobs || []
        this.metadata = data.metadata || null
        this.lastFetch = now

        console.log(`📊 Loaded ${this.jobs.length} jobs from scraped data`)
        return this.jobs
      } else {
        console.warn("Failed to fetch jobs from API, using fallback data")
        return this.getFallbackJobs()
      }
    } catch (error) {
      console.error("Error loading jobs:", error)
      return this.getFallbackJobs()
    }
  }

  private getFallbackJobs(): JobListing[] {
    // Fallback to mock data if scraping hasn't run yet
    return [
      {
        id: "fallback-1",
        title: "Software Engineer",
        company: "Tech Company",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: { min: 120000, max: 180000, currency: "USD" },
        description: "Join our team as a Software Engineer. This is fallback data - run the scraper to see real jobs!",
        requirements: ["Bachelor's degree", "3+ years experience", "JavaScript/TypeScript"],
        benefits: ["Health insurance", "401k", "Remote work"],
        postedDate: new Date().toISOString().split("T")[0],
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        industry: "Technology",
        experienceLevel: "Mid",
        remote: true,
        companyLogo: "/placeholder.svg?height=40&width=40",
        source: "fallback",
      },
    ]
  }

  async getCompanyJobs(companyName: string): Promise<JobListing[]> {
    const allJobs = await this.loadJobs()
    return allJobs.filter((job) => job.company.toLowerCase() === companyName.toLowerCase())
  }

  async getActiveJobs(): Promise<JobListing[]> {
    const allJobs = await this.loadJobs()
    return allJobs.filter((job) => (job as any).isActive !== false)
  }

  async getExpiredJobs(): Promise<JobListing[]> {
    // This would typically load from individual company files
    // For now, return empty array
    return []
  }

  getMetadata(): JobMetadata | null {
    return this.metadata
  }

  async refreshJobs(): Promise<JobListing[]> {
    return this.loadJobs(true)
  }

  getStats() {
    return {
      totalJobs: this.jobs.length,
      lastUpdated: this.metadata?.lastUpdated || null,
      companies: this.metadata?.companies || {},
      cacheAge: Date.now() - this.lastFetch,
    }
  }
}

export const jobDataService = JobDataService.getInstance()
